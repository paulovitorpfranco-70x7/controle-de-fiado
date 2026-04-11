import { httpPost } from "../../../shared/api/http";
import type { Payment } from "../types/payment";

export type CreatePaymentPayload = {
  customerId: string;
  amount: number;
  paymentDate: string;
  method: "CASH" | "PIX" | "CARD";
  notes?: string;
  createdById: string;
};

export function createPayment(payload: CreatePaymentPayload) {
  return httpPost<Payment>("/payments", payload);
}
