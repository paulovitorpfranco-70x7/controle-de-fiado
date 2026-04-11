import type { SaleRepository } from "../../ports/sale-repository.js";

export class ListSalesUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(customerId?: string) {
    if (customerId) {
      return this.saleRepository.listByCustomer(customerId);
    }

    return this.saleRepository.list();
  }
}
