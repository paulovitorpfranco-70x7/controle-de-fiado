import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Customer } from "../types/customer";
import { createSupabaseCustomer } from "./supabase-customers";

export type CreateCustomerPayload = {
  name: string;
  phone: string;
  address?: string;
  creditLimit?: number;
  notes?: string;
};

export function createCustomer(payload: CreateCustomerPayload) {
  if (isSupabaseDataEnabled()) {
    return createSupabaseCustomer(payload);
  }

  return httpPost<Customer>("/customers", payload);
}
