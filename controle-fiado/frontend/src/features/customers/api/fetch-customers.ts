import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Customer } from "../types/customer";
import { fetchSupabaseCustomers } from "./supabase-customers";

export function fetchCustomers() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseCustomers();
  }

  return httpGet<Customer[]>("/customers");
}
