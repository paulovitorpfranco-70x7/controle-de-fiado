import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { ChargeMessage } from "../types/charge-message";
import { retrySupabaseFailedCharge } from "./supabase-charges";

export function retryFailedCharge(messageId: string) {
  if (isSupabaseDataEnabled()) {
    return retrySupabaseFailedCharge(messageId);
  }

  return httpPost<ChargeMessage>(`/charges/messages/${messageId}/retry`, {});
}
