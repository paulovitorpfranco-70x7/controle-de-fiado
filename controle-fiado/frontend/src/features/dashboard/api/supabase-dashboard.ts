import { supabase } from "../../../shared/supabase/client";
import type { DashboardSummary } from "../types/dashboard-summary";

type OpenSaleRow = {
  customer_id: string;
  remaining_amount_cents: number;
  due_date: string;
  customer?: Array<{
    id: string;
    name: string;
    phone: string;
  }> | null;
};

type PaymentAggregateRow = {
  amount_cents: number;
};

type SalesAggregateRow = {
  final_amount_cents: number;
};

type CustomerBalanceRow = {
  id: string;
  name: string;
  phone: string;
  sales?: Array<{
    remaining_amount_cents: number;
  }>;
};

export async function fetchSupabaseDashboardSummary(): Promise<DashboardSummary> {
  ensureSupabase();

  const referenceDate = new Date();
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);
  const dueSoonStart = startOfDay(addDays(referenceDate, 1));
  const dueSoonEnd = endOfDay(addDays(referenceDate, 3));
  const monthStart = startOfMonth(referenceDate);

  const [openSalesResult, dueTodayResult, dueSoonResult, recentPaymentsResult, recentSalesResult, customerBalancesResult, overdueResult] =
    await Promise.all([
      supabase!
        .from("sales")
        .select("customer_id, remaining_amount_cents, due_date, customer:customers(id, name, phone)")
        .in("status", ["OPEN", "PARTIAL", "OVERDUE"])
        .gt("remaining_amount_cents", 0),
      supabase!
        .from("sales")
        .select("id", { count: "exact", head: true })
        .in("status", ["OPEN", "PARTIAL", "OVERDUE"])
        .gt("remaining_amount_cents", 0)
        .gte("due_date", todayStart.toISOString())
        .lte("due_date", todayEnd.toISOString()),
      supabase!
        .from("sales")
        .select("id", { count: "exact", head: true })
        .in("status", ["OPEN", "PARTIAL", "OVERDUE"])
        .gt("remaining_amount_cents", 0)
        .gte("due_date", dueSoonStart.toISOString())
        .lte("due_date", dueSoonEnd.toISOString()),
      supabase!
        .from("payments")
        .select("amount_cents")
        .gte("payment_date", monthStart.toISOString()),
      supabase!
        .from("sales")
        .select("final_amount_cents")
        .gte("sale_date", monthStart.toISOString()),
      supabase!
        .from("customers")
        .select("id, name, phone, sales!left(remaining_amount_cents)")
        .order("name", { ascending: true }),
      supabase!
        .from("sales")
        .select("customer_id")
        .eq("status", "OVERDUE")
        .gt("remaining_amount_cents", 0)
    ]);

  throwIfError(openSalesResult.error, "Falha ao carregar saldos em aberto do dashboard.");
  throwIfError(dueTodayResult.error, "Falha ao carregar vencimentos de hoje.");
  throwIfError(dueSoonResult.error, "Falha ao carregar vencimentos proximos.");
  throwIfError(recentPaymentsResult.error, "Falha ao carregar pagamentos do mes.");
  throwIfError(recentSalesResult.error, "Falha ao carregar vendas do mes.");
  throwIfError(customerBalancesResult.error, "Falha ao carregar maiores saldos.");
  throwIfError(overdueResult.error, "Falha ao carregar clientes vencidos.");

  const openSales = (openSalesResult.data ?? []) as OpenSaleRow[];
  const recentPayments = (recentPaymentsResult.data ?? []) as PaymentAggregateRow[];
  const recentSales = (recentSalesResult.data ?? []) as SalesAggregateRow[];
  const customerBalances = (customerBalancesResult.data ?? []) as CustomerBalanceRow[];

  const totalOpenBalance = openSales.reduce((total, sale) => total + sale.remaining_amount_cents, 0) / 100;

  const topDebtors = customerBalances
    .map((customer) => ({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      openBalance: (customer.sales ?? []).reduce((total, sale) => total + sale.remaining_amount_cents, 0) / 100
    }))
    .filter((customer) => customer.openBalance > 0)
    .sort((left, right) => right.openBalance - left.openBalance)
    .slice(0, 5);

  return {
    totalOpenBalance,
    overdueCustomers: new Set((overdueResult.data ?? []).map((sale) => sale.customer_id)).size,
    dueTodayCount: dueTodayResult.count ?? 0,
    dueSoonCount: dueSoonResult.count ?? 0,
    recentPaymentsTotal: recentPayments.reduce((total, payment) => total + payment.amount_cents, 0) / 100,
    recentSalesTotal: recentSales.reduce((total, sale) => total + sale.final_amount_cents, 0) / 100,
    topDebtors
  };
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
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
