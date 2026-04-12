import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { ChargeMessage } from "../types/charge-message";
import { fetchSupabaseChargeMessages } from "./supabase-charges";

export function fetchChargeMessages(customerId?: string) {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseChargeMessages(customerId);
  }

  const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
  return httpGet<ChargeMessage[]>(`/charges/messages${query}`);
}
