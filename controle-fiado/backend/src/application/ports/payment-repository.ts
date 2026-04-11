import type { Payment } from "../../domain/payments/payment.js";
import type { CreatePaymentInput } from "../payments/dto/create-payment.dto.js";
import type { PaymentAllocationResult } from "../../domain/payments/payment-allocation.js";

export interface PaymentRepository {
  list(): Promise<Payment[]>;
  listByCustomer(customerId: string): Promise<Payment[]>;
  createWithAllocations(input: CreatePaymentInput, allocations: PaymentAllocationResult[]): Promise<Payment>;
}
