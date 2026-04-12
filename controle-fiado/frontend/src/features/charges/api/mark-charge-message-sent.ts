import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { ChargeMessage } from "../types/charge-message";
import { markSupabaseChargeMessageSent } from "./supabase-charges";

export function markChargeMessageSent(messageId: string) {
  if (isSupabaseDataEnabled()) {
    return markSupabaseChargeMessageSent(messageId);
  }

  return httpPost<ChargeMessage>(`/charges/messages/${messageId}/mark-sent`, {});
}
