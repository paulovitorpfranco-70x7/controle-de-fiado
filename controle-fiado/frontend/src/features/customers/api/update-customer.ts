import { httpPatch } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Customer } from "../types/customer";
import { updateSupabaseCustomer } from "./supabase-customers";

export type UpdateCustomerPayload = {
  name?: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  notes?: string;
  isActive?: boolean;
};

export function updateCustomer(customerId: string, payload: UpdateCustomerPayload) {
  if (isSupabaseDataEnabled()) {
    return updateSupabaseCustomer(customerId, payload);
  }

  return httpPatch<Customer>(`/customers/${customerId}`, payload);
}
