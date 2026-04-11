import type { ChargeMessageRepository } from "../../ports/charge-message-repository.js";

export class ListChargeMessagesUseCase {
  constructor(private readonly chargeMessageRepository: ChargeMessageRepository) {}

  async execute(customerId?: string) {
    if (customerId) {
      return this.chargeMessageRepository.listByCustomer(customerId);
    }

    return this.chargeMessageRepository.list();
  }
}
