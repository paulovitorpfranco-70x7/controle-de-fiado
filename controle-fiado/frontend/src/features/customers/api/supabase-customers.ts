import { supabase } from "../../../shared/supabase/client";
import { normalizeBrazilPhoneToE164 } from "../../../shared/utils/phone";
import type { Customer } from "../types/customer";
import type { CustomerDetail } from "../types/customer-detail";
import type { CreateCustomerPayload } from "./create-customer";

type CustomerBaseRow = {
  id: string;
  name: string;
  phone: string;
  phone_e164: string | null;
  address: string | null;
  credit_limit_cents: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

type CustomerRow = CustomerBaseRow & {
  sales?: Array<{
    remaining_amount_cents: number;
    status: "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELED";
  }>;
};

type CustomerDetailRow = CustomerBaseRow & {
  sales?: Array<{
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
  }>;
  payments?: Array<{
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
  }>;
};

export async function fetchSupabaseCustomers(): Promise<Customer[]> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("customers")
    .select("id, name, phone, phone_e164, address, credit_limit_cents, notes, is_active, created_at, sales(remaining_amount_cents, status)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message || "Falha ao carregar clientes no Supabase.");
  }

  return ((data ?? []) as CustomerRow[]).map(mapCustomerRow);
}

export async function createSupabaseCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("customers")
    .insert({
      name: payload.name,
      phone: payload.phone,
      phone_e164: normalizeBrazilPhoneToE164(payload.phone),
      address: payload.address || null,
      credit_limit_cents: payload.creditLimit !== undefined ? Math.round(payload.creditLimit * 100) : null,
      notes: payload.notes || null
    })
    .select("id, name, phone, phone_e164, address, credit_limit_cents, notes, is_active, created_at")
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao criar cliente no Supabase.");
  }

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    phoneE164: data.phone_e164 ?? normalizeBrazilPhoneToE164(data.phone),
    address: data.address,
    creditLimit: toMoney(data.credit_limit_cents),
    notes: data.notes,
    isActive: data.is_active,
    openBalance: 0,
    createdAt: data.created_at
  };
}

export async function fetchSupabaseCustomerDetail(customerId: string): Promise<CustomerDetail> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("customers")
    .select(
      "id, name, phone, phone_e164, address, credit_limit_cents, notes, is_active, created_at, sales(*), payments(*, payment_allocations(*))"
    )
    .eq("id", customerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Falha ao carregar ficha do cliente no Supabase.");
  }

  if (!data) {
    throw new Error("Cliente nao encontrado.");
  }

  return mapCustomerDetailRow(data as CustomerDetailRow);
}

function mapCustomerRow(customer: CustomerRow): Customer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    phoneE164: customer.phone_e164 ?? normalizeBrazilPhoneToE164(customer.phone),
    address: customer.address,
    creditLimit: toMoney(customer.credit_limit_cents),
    notes: customer.notes,
    isActive: customer.is_active,
    openBalance: (customer.sales ?? [])
      .filter((sale) => ["OPEN", "PARTIAL", "OVERDUE"].includes(sale.status))
      .reduce((total, sale) => total + sale.remaining_amount_cents, 0) / 100,
    createdAt: customer.created_at
  };
}

function mapCustomerDetailRow(customer: CustomerDetailRow): CustomerDetail {
  const sales = (customer.sales ?? [])
    .slice()
    .sort((left, right) => new Date(right.sale_date).getTime() - new Date(left.sale_date).getTime())
    .map((sale) => ({
      id: sale.id,
      customerId: sale.customer_id,
      description: sale.description,
      originalAmount: sale.original_amount_cents / 100,
      feeAmount: sale.fee_amount_cents / 100,
      finalAmount: sale.final_amount_cents / 100,
      remainingAmount: sale.remaining_amount_cents / 100,
      saleDate: sale.sale_date,
      dueDate: sale.due_date,
      status: sale.status,
      createdById: sale.created_by_profile_id,
      createdAt: sale.created_at
    }));

  const payments = (customer.payments ?? [])
    .slice()
    .sort((left, right) => new Date(right.payment_date).getTime() - new Date(left.payment_date).getTime())
    .map((payment) => ({
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
    }));

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    phoneE164: customer.phone_e164 ?? normalizeBrazilPhoneToE164(customer.phone),
    address: customer.address,
    creditLimit: toMoney(customer.credit_limit_cents),
    notes: customer.notes,
    isActive: customer.is_active,
    createdAt: customer.created_at,
    openBalance: sales
      .filter((sale) => ["OPEN", "PARTIAL", "OVERDUE"].includes(sale.status))
      .reduce((total, sale) => total + sale.remainingAmount, 0),
    sales,
    payments
  };
}

function toMoney(value: number | null) {
  return value === null ? null : value / 100;
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}
