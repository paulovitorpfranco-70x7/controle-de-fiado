import { supabase } from "../../../shared/supabase/client";
import { parseLocalDateInput } from "../../../shared/utils/date-db";
import type { Payment } from "../types/payment";

type PaymentRow = {
  id: string;
  customer_id: string;
  amount_cents: number;
  payment_date: string;
  method: "CASH" | "PIX" | "CARD";
  notes: string | null;
  created_by_profile_id: string;
  created_at: string;
  payment_allocations?: Array<{
    sale_id: string;
    amount_cents: number;
  }>;
};

type RegisterPaymentRpcResult = {
  payment_id: string;
};

export type CreateSupabasePaymentPayload = {
  customerId: string;
  amount: number;
  paymentDate: string;
  method: "CASH" | "PIX" | "CARD";
  notes?: string;
  createdById: string;
  targetSaleId?: string | null;
};

export async function fetchSupabasePayments() {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("payments")
    .select("*, payment_allocations(sale_id, amount_cents)")
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Falha ao carregar pagamentos no Supabase.");
  }

  return ((data ?? []) as PaymentRow[]).map(mapPaymentRow);
}

export async function createSupabasePayment(payload: CreateSupabasePaymentPayload) {
  ensureSupabase();

  const { data, error } = await supabase!.rpc("register_payment", {
    p_customer_id: payload.customerId,
    p_amount_cents: toCents(payload.amount),
    p_payment_date: parseLocalDateInput(payload.paymentDate).toISOString(),
    p_method: payload.method,
    p_notes: payload.notes ?? null,
    p_target_sale_id: payload.targetSaleId ?? null
  });

  if (error) {
    throw new Error(error.message || "Falha ao registrar pagamento no Supabase.");
  }

  const paymentId = (data as RegisterPaymentRpcResult | null)?.payment_id;

  if (!paymentId) {
    throw new Error("Pagamento criado sem retorno de identificador.");
  }

  const { data: createdPayment, error: loadError } = await supabase!
    .from("payments")
    .select("*, payment_allocations(sale_id, amount_cents)")
    .eq("id", paymentId)
    .single();

  if (loadError) {
    throw new Error(loadError.message || "Pagamento criado, mas nao foi possivel recarregar os dados.");
  }

  return mapPaymentRow(createdPayment as PaymentRow);
}

function mapPaymentRow(payment: PaymentRow): Payment {
  return {
    id: payment.id,
    customerId: payment.customer_id,
    amount: payment.amount_cents / 100,
    paymentDate: payment.payment_date,
    method: payment.method,
    notes: payment.notes,
    createdById: payment.created_by_profile_id,
    createdAt: payment.created_at,
    allocations: (payment.payment_allocations ?? []).map((allocation) => ({
      saleId: allocation.sale_id,
      amount: allocation.amount_cents / 100
    }))
  };
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}
