import { supabase } from "../../../shared/supabase/client";
import { normalizeBrazilPhoneToE164 } from "../../../shared/utils/phone";
import type { ChargeMessage } from "../types/charge-message";
import type { ChargeOverview, ChargeOverviewItem } from "../types/charge-overview";
import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";

type SaleOverviewRow = {
  id: string;
  customer_id: string;
  due_date: string;
  remaining_amount_cents: number;
  status: "OPEN" | "PARTIAL" | "OVERDUE" | "PAID" | "CANCELED";
};

type MessageRow = {
  id: string;
  customer_id: string;
  sale_id: string | null;
  trigger_type: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  message_body: string;
  send_status: "PENDING" | "SENT" | "FAILED" | "CANCELED";
  provider_name: string | null;
  provider_message_id: string | null;
  provider_response: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_by_profile_id: string | null;
  created_at: string;
};

type CustomerLookupRow = {
  id: string;
  name: string;
  phone: string;
  phone_e164: string | null;
};

type AuditRow = {
  action: string;
  created_at: string;
  payload_json: Record<string, unknown> | null;
};

export async function fetchSupabaseChargeOverview(): Promise<ChargeOverview> {
  ensureSupabase();

  const referenceDate = new Date();
  const todayStart = startOfDay(referenceDate).toISOString();
  const todayEnd = endOfDay(referenceDate).toISOString();
  const dueSoonStart = startOfDay(addDays(referenceDate, 3)).toISOString();
  const dueSoonEnd = endOfDay(addDays(referenceDate, 3)).toISOString();

  const [dueSoonResult, dueTodayResult, overdueResult] = await Promise.all([
    querySalesWindow({
      from: dueSoonStart,
      to: dueSoonEnd
    }),
    querySalesWindow({
      from: todayStart,
      to: todayEnd
    }),
    supabase!
      .from("sales")
      .select("id, customer_id, due_date, remaining_amount_cents, status")
      .in("status", ["OPEN", "PARTIAL", "OVERDUE"])
      .gt("remaining_amount_cents", 0)
      .lt("due_date", todayStart)
      .order("due_date", { ascending: true })
  ]);

  throwIfError(dueSoonResult.error, "Falha ao carregar cobrancas proximas.");
  throwIfError(dueTodayResult.error, "Falha ao carregar cobrancas de hoje.");
  throwIfError(overdueResult.error, "Falha ao carregar cobrancas em atraso.");

  const sales = [
    ...((dueSoonResult.data ?? []) as SaleOverviewRow[]),
    ...((dueTodayResult.data ?? []) as SaleOverviewRow[]),
    ...((overdueResult.data ?? []) as SaleOverviewRow[])
  ];
  const customerMap = await fetchCustomerMap(sales.map((sale) => sale.customer_id));

  return {
    dueSoon: ((dueSoonResult.data ?? []) as SaleOverviewRow[]).map((sale) => mapOverviewRow(sale, customerMap)),
    dueToday: ((dueTodayResult.data ?? []) as SaleOverviewRow[]).map((sale) => mapOverviewRow(sale, customerMap)),
    overdue: ((overdueResult.data ?? []) as SaleOverviewRow[]).map((sale) => mapOverviewRow(sale, customerMap))
  };
}

export async function fetchSupabaseChargeMessages(customerId?: string): Promise<ChargeMessage[]> {
  ensureSupabase();

  const query = supabase!
    .from("whatsapp_messages")
    .select("id, customer_id, sale_id, trigger_type, message_body, send_status, provider_name, provider_message_id, provider_response, scheduled_for, sent_at, created_by_profile_id, created_at")
    .order("created_at", { ascending: false });

  const { data, error } = customerId ? await query.eq("customer_id", customerId) : await query;

  throwIfError(error, "Falha ao carregar mensagens de cobranca.");

  const messages = (data ?? []) as MessageRow[];
  const customerMap = await fetchCustomerMap(messages.map((message) => message.customer_id));

  return messages.map((message) => mapMessageRow(message, customerMap));
}

export async function fetchSupabaseDailyChargeJobMonitor(): Promise<DailyChargeJobMonitor> {
  ensureSupabase();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [lastAuditResult, failedTotalResult, failedLast7Result, latestFailedResult] = await Promise.all([
    supabase!
      .from("audit_logs")
      .select("action, created_at, payload_json")
      .eq("entity_type", "job")
      .eq("entity_id", "daily-charge-job")
      .in("action", ["daily_charge_job_ran", "daily_charge_job_failed"])
      .order("created_at", { ascending: false })
      .limit(1),
    supabase!
      .from("whatsapp_messages")
      .select("id", { count: "exact", head: true })
      .eq("send_status", "FAILED"),
    supabase!
      .from("whatsapp_messages")
      .select("id", { count: "exact", head: true })
      .eq("send_status", "FAILED")
      .gte("created_at", sevenDaysAgo),
    supabase!
      .from("whatsapp_messages")
      .select("created_at, provider_response")
      .eq("send_status", "FAILED")
      .order("created_at", { ascending: false })
      .limit(1)
  ]);

  throwIfError(lastAuditResult.error, "Falha ao carregar monitor do job.");
  throwIfError(failedTotalResult.error, "Falha ao carregar falhas totais.");
  throwIfError(failedLast7Result.error, "Falha ao carregar falhas recentes.");
  throwIfError(latestFailedResult.error, "Falha ao carregar ultima falha.");

  const lastAudit = ((lastAuditResult.data ?? []) as AuditRow[])[0] ?? null;
  const latestFailed = ((latestFailedResult.data ?? []) as Array<{ created_at: string; provider_response: string | null }>)[0] ?? null;

  return {
    lastRunAt: lastAudit?.created_at ?? null,
    lastRunStatus:
      lastAudit?.action === "daily_charge_job_ran"
        ? "success"
        : lastAudit?.action === "daily_charge_job_failed"
          ? "failed"
          : "never",
    lastRunSummary: lastAudit?.payload_json ?? null,
    failedMessagesTotal: failedTotalResult.count ?? 0,
    failedMessagesLast7Days: failedLast7Result.count ?? 0,
    lastFailureAt: latestFailed?.created_at ?? null,
    lastFailureMessage: latestFailed?.provider_response ?? null
  };
}

export async function runSupabaseDailyChargeJob() {
  ensureSupabase();

  const { data, error } = await supabase!.rpc("run_daily_charge_job");
  throwIfError(error, "Falha ao executar job diario de cobranca.");
  return data as {
    processedAt: string;
    auto3DaysSent: number;
    autoDueDateSent: number;
    skippedDuplicates: number;
    failedMessages: number;
  };
}

export async function sendSupabaseManualCharge(input: {
  customerId: string;
  saleId?: string;
  messageBody?: string;
  createdById: string;
}) {
  ensureSupabase();

  const context = await findChargeContext(input.customerId, input.saleId);

  if (!context) {
    throw new Error("Contexto de cobranca nao encontrado.");
  }

  const { data, error } = await supabase!
    .from("whatsapp_messages")
    .insert({
      customer_id: context.customerId,
      sale_id: context.saleId,
      trigger_type: "MANUAL",
      message_body: input.messageBody ?? buildManualChargeMessage(context.customerName, context.remainingAmount, context.dueDate),
      send_status: "PENDING",
      provider_name: "wa_link",
      provider_response: "Mensagem preparada para envio manual.",
      created_by_profile_id: input.createdById
    })
    .select("id, customer_id, sale_id, trigger_type, message_body, send_status, provider_name, provider_message_id, provider_response, scheduled_for, sent_at, created_by_profile_id, created_at")
    .single();

  throwIfError(error, "Falha ao criar mensagem manual.");
  const customerMap = await fetchCustomerMap([context.customerId]);
  return mapMessageRow(data as MessageRow, customerMap);
}

export async function markSupabaseChargeMessageSent(messageId: string) {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("whatsapp_messages")
    .update({
      send_status: "SENT",
      provider_response: "Mensagem marcada como enviada manualmente.",
      sent_at: new Date().toISOString()
    })
    .eq("id", messageId)
    .select("id, customer_id, sale_id, trigger_type, message_body, send_status, provider_name, provider_message_id, provider_response, scheduled_for, sent_at, created_by_profile_id, created_at")
    .single();

  throwIfError(error, "Falha ao marcar mensagem como enviada.");
  const message = data as MessageRow;
  const customerMap = await fetchCustomerMap([message.customer_id]);
  return mapMessageRow(message, customerMap);
}

export async function retrySupabaseFailedCharge(messageId: string) {
  ensureSupabase();

  const { data: existing, error: loadError } = await supabase!
    .from("whatsapp_messages")
    .select("id, customer_id, sale_id, trigger_type, message_body, send_status, provider_name, provider_message_id, provider_response, scheduled_for, sent_at, created_by_profile_id, created_at")
    .eq("id", messageId)
    .single();

  throwIfError(loadError, "Falha ao carregar mensagem para reenvio.");

  const source = existing as MessageRow;

  if (source.send_status !== "FAILED") {
    throw new Error("Apenas mensagens com falha podem ser reenviadas.");
  }

  const { data, error } = await supabase!
    .from("whatsapp_messages")
    .insert({
      customer_id: source.customer_id,
      sale_id: source.sale_id,
      trigger_type: source.trigger_type,
      message_body: source.message_body,
      send_status: "PENDING",
      provider_name: "wa_link",
      provider_response: "Mensagem recriada para novo envio manual.",
      created_by_profile_id: source.created_by_profile_id
    })
    .select("id, customer_id, sale_id, trigger_type, message_body, send_status, provider_name, provider_message_id, provider_response, scheduled_for, sent_at, created_by_profile_id, created_at")
    .single();

  throwIfError(error, "Falha ao reenviar mensagem.");
  const customerMap = await fetchCustomerMap([source.customer_id]);
  return mapMessageRow(data as MessageRow, customerMap);
}

async function querySalesWindow(input: { from: string; to: string }) {
  return supabase!
    .from("sales")
    .select("id, customer_id, due_date, remaining_amount_cents, status")
    .in("status", ["OPEN", "PARTIAL", "OVERDUE"])
    .gt("remaining_amount_cents", 0)
    .gte("due_date", input.from)
    .lte("due_date", input.to)
    .order("due_date", { ascending: true });
}

async function findChargeContext(customerId: string, saleId?: string) {
  ensureSupabase();

  let query = supabase!
    .from("sales")
    .select("id, customer_id, due_date, remaining_amount_cents, status")
    .eq("customer_id", customerId)
    .in("status", ["OPEN", "PARTIAL", "OVERDUE"])
    .gt("remaining_amount_cents", 0)
    .order("due_date", { ascending: true })
    .order("sale_date", { ascending: true })
    .limit(1);

  if (saleId) {
    query = query.eq("id", saleId);
  }

  const { data, error } = await query.maybeSingle();
  throwIfError(error, "Falha ao carregar contexto da cobranca.");

  const row = data as SaleOverviewRow | null;

  if (!row) {
    return null;
  }

  const customer = await fetchCustomerById(row.customer_id);

  return {
    customerId: row.customer_id,
    saleId: row.id,
    dueDate: row.due_date,
    remainingAmount: row.remaining_amount_cents / 100,
    customerName: customer?.name?.trim() || "Cliente"
  };
}

function mapOverviewRow(sale: SaleOverviewRow, customerMap: Map<string, CustomerLookupRow>): ChargeOverviewItem {
  const customer = customerMap.get(sale.customer_id) ?? null;

  return {
    customerId: sale.customer_id,
    customerName: customer?.name?.trim() || "Cliente",
    phone: customer?.phone ?? "",
    phoneE164: customer?.phone_e164 ?? normalizeBrazilPhoneToE164(customer?.phone),
    saleId: sale.id,
    dueDate: sale.due_date,
    remainingAmount: sale.remaining_amount_cents / 100,
    status: sale.status as "OPEN" | "PARTIAL" | "OVERDUE"
  };
}

function mapMessageRow(message: MessageRow, customerMap: Map<string, CustomerLookupRow>): ChargeMessage {
  const customer = customerMap.get(message.customer_id) ?? null;

  return {
    id: message.id,
    customerId: message.customer_id,
    customerName: customer?.name?.trim() || null,
    phone: customer?.phone ?? null,
    phoneE164: customer?.phone_e164 ?? normalizeBrazilPhoneToE164(customer?.phone),
    saleId: message.sale_id,
    triggerType: message.trigger_type,
    messageBody: message.message_body,
    sendStatus: message.send_status,
    providerName: message.provider_name,
    providerMessageId: message.provider_message_id,
    providerResponse: message.provider_response,
    scheduledFor: message.scheduled_for,
    sentAt: message.sent_at,
    createdById: message.created_by_profile_id,
    createdAt: message.created_at
  };
}

function buildManualChargeMessage(customerName: string, openBalance: number, dueDate?: string | null) {
  const balance = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(openBalance);

  const dueText = dueDate
    ? ` com vencimento em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dueDate))}`
    : "";

  return `Ola ${customerName}, seu saldo em aberto no Mercadinho do Tonhao e de ${balance}${dueText}. Responda esta mensagem para combinar o pagamento.`;
}

async function fetchCustomerMap(customerIds: string[]) {
  const uniqueIds = [...new Set(customerIds.filter(Boolean))];

  if (!uniqueIds.length) {
    return new Map<string, CustomerLookupRow>();
  }

  const { data, error } = await supabase!
    .from("customers")
    .select("id, name, phone, phone_e164")
    .in("id", uniqueIds);

  throwIfError(error, "Falha ao carregar clientes da cobranca.");

  return new Map(((data ?? []) as CustomerLookupRow[]).map((customer) => [customer.id, customer]));
}

async function fetchCustomerById(customerId: string) {
  const customerMap = await fetchCustomerMap([customerId]);
  return customerMap.get(customerId) ?? null;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function throwIfError(error: { message?: string } | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}
