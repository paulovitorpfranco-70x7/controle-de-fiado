import type { OpenSaleBalance } from "../sales/dto/open-sale-balance.dto.js";

export interface SaleBalanceRepository {
  listOpenBalancesByCustomer(customerId: string): Promise<OpenSaleBalance[]>;
}
