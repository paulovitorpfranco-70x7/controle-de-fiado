import type { CreateSaleInput } from "../sales/dto/create-sale.dto.js";
import type { Sale } from "../../domain/sales/sale.js";

export interface SaleRepository {
  list(): Promise<Sale[]>;
  listByCustomer(customerId: string): Promise<Sale[]>;
  create(input: CreateSaleInput): Promise<Sale>;
}
