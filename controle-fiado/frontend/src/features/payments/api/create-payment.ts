import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Payment } from "../types/payment";
import { createSupabasePayment } from "./supabase-payments";

export type CreatePaymentPayload = {
  customerId: string;
  amount: number;
  paymentDate: string;
  method: "CASH" | "PIX" | "CARD";
  notes?: string;
  createdById: string;
};

export function createPayment(payload: CreatePaymentPayload) {
  if (isSupabaseDataEnabled()) {
    return createSupabasePayment(payload);
  }

  return httpPost<Payment>("/payments", payload);
}
