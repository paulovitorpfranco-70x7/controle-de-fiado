import type { PaymentRepository } from "../../ports/payment-repository.js";

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(customerId?: string) {
    if (customerId) {
      return this.paymentRepository.listByCustomer(customerId);
    }

    return this.paymentRepository.list();
  }
}
