import type { CustomerDetail } from "../customers/dto/customer-detail.dto.js";

export interface CustomerDetailRepository {
  findById(id: string): Promise<CustomerDetail | null>;
}
