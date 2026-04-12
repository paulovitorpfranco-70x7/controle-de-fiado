import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { CustomerDetail } from "../types/customer-detail";
import { fetchSupabaseCustomerDetail } from "./supabase-customers";

export function fetchCustomerDetail(customerId: string) {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseCustomerDetail(customerId);
  }

  return httpGet<CustomerDetail>(`/customers/${customerId}`);
}
