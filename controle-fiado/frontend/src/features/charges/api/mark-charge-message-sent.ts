import { httpPost } from "../../../shared/api/http";
import type { ChargeMessage } from "../types/charge-message";

export function markChargeMessageSent(messageId: string) {
  return httpPost<ChargeMessage>(`/charges/messages/${messageId}/mark-sent`, {});
}
