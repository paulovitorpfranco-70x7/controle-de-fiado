import { supabase } from "../../../shared/supabase/client";
import { parseLocalDateInput, parseLocalEndOfDayInput } from "../../../shared/utils/date-db";
import type { Sale, SaleItem } from "../types/sale";
import { parseSaleDescription, serializeSaleDescription } from "../utils/sale-items";

type SaleRow = {
  id: string;
  customer_id: string;
  description: string;
  original_amount_cents: number;
  fee_amount_cents: number;
  final_amount_cents: number;
  remaining_amount_cents: number;
  sale_date: string;
  due_date: string;
  status: "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELED";
  created_by_profile_id: string;
  created_at: string;
};

export type CreateSupabaseSalePayload = {
  customerId: string;
  description: string;
  saleItems?: SaleItem[];
  originalAmount: number;
  feeAmount?: number;
  feePercent?: number;
  saleDate: string;
  dueDate: string;
  createdById: string;
};

export async function fetchSupabaseSales() {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Falha ao carregar vendas no Supabase.");
  }

  return ((data ?? []) as SaleRow[]).map(mapSaleRow);
}

export async function createSupabaseSale(payload: CreateSupabaseSalePayload) {
  ensureSupabase();

  const amounts = calculateSaleAmounts({
    originalAmount: payload.originalAmount,
    feeAmount: payload.feeAmount,
    feePercent: payload.feePercent
  });

  const saleDate = parseLocalDateInput(payload.saleDate);
  const dueDate = parseLocalEndOfDayInput(payload.dueDate);

  if (dueDate.getTime() < saleDate.getTime()) {
    throw new Error("Data de vencimento deve ser igual ou posterior a data da venda.");
  }

  const status = resolveSaleStatus({
    remainingAmount: amounts.finalAmount,
    dueDate
  });

  const { data, error } = await supabase!
    .from("sales")
    .insert({
      customer_id: payload.customerId,
      description: serializeSaleDescription(payload.description, payload.saleItems ?? []),
      original_amount_cents: toCents(amounts.originalAmount),
      fee_amount_cents: toCents(amounts.feeAmount),
      final_amount_cents: toCents(amounts.finalAmount),
      remaining_amount_cents: toCents(amounts.finalAmount),
      sale_date: saleDate.toISOString(),
      due_date: dueDate.toISOString(),
      status,
      created_by_profile_id: payload.createdById
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao criar venda no Supabase.");
  }

  return mapSaleRow(data as SaleRow);
}

function mapSaleRow(sale: SaleRow): Sale {
  const parsedDescription = parseSaleDescription(sale.description);

  return {
    id: sale.id,
    customerId: sale.customer_id,
    description: parsedDescription.description,
    saleItems: parsedDescription.saleItems,
    originalAmount: sale.original_amount_cents / 100,
    feeAmount: sale.fee_amount_cents / 100,
    finalAmount: sale.final_amount_cents / 100,
    remainingAmount: sale.remaining_amount_cents / 100,
    saleDate: sale.sale_date,
    dueDate: sale.due_date,
    status: sale.status,
    createdById: sale.created_by_profile_id,
    createdAt: sale.created_at
  };
}

function calculateSaleAmounts(input: { originalAmount: number; feeAmount?: number; feePercent?: number }) {
  const feeAmount = input.feeAmount ?? roundCurrency(input.originalAmount * ((input.feePercent ?? 0) / 100));
  const finalAmount = roundCurrency(input.originalAmount + feeAmount);

  return {
    originalAmount: roundCurrency(input.originalAmount),
    feeAmount,
    finalAmount
  };
}

function resolveSaleStatus(input: { remainingAmount: number; dueDate: Date; now?: Date }) {
  const now = input.now ?? new Date();

  if (input.remainingAmount <= 0) return "PAID" as const;
  if (input.dueDate.getTime() < now.getTime()) return "OVERDUE" as const;
  return "OPEN" as const;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}
