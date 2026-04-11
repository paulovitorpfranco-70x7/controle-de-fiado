import type { PaymentMethod } from "../../../domain/payments/payment.js";

export type CreatePaymentInput = {
  customerId: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  notes?: string;
  createdById: string;
};
