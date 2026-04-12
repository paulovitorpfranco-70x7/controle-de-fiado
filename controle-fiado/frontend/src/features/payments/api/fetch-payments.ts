import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Payment } from "../types/payment";
import { fetchSupabasePayments } from "./supabase-payments";

export function fetchPayments() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabasePayments();
  }

  return httpGet<Payment[]>("/payments");
}
