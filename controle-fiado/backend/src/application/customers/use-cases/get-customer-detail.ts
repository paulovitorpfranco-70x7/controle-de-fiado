import type { CustomerDetailRepository } from "../../ports/customer-detail-repository.js";

export class GetCustomerDetailUseCase {
  constructor(private readonly customerDetailRepository: CustomerDetailRepository) {}

  async execute(id: string) {
    return this.customerDetailRepository.findById(id);
  }
}
