import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { ChargeMessage } from "../types/charge-message";
import { sendSupabaseManualCharge } from "./supabase-charges";

export type SendManualChargePayload = {
  customerId: string;
  saleId?: string;
  messageBody?: string;
  createdById: string;
};

export function sendManualCharge(payload: SendManualChargePayload) {
  if (isSupabaseDataEnabled()) {
    return sendSupabaseManualCharge(payload);
  }

  return httpPost<ChargeMessage>("/charges/messages/manual", payload);
}
