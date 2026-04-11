import { httpPost } from "../../../shared/api/http";
import type { ChargeMessage } from "../types/charge-message";

export type SendManualChargePayload = {
  customerId: string;
  saleId?: string;
  messageBody?: string;
  createdById: string;
};

export function sendManualCharge(payload: SendManualChargePayload) {
  return httpPost<ChargeMessage>("/charges/messages/manual", payload);
}
