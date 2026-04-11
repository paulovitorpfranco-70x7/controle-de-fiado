import type { CustomerRepository } from "../../ports/customer-repository.js";

export class ListCustomersUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute() {
    return this.customerRepository.listWithOpenBalance();
  }
}
