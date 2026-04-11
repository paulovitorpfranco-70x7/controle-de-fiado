import type { CreateCustomerInput, UpdateCustomerInput } from "../customers/dto/customer.dto.js";
import type { Customer, CustomerSummary } from "../../domain/customers/customer.js";

export interface CustomerRepository {
  listWithOpenBalance(): Promise<CustomerSummary[]>;
  create(input: CreateCustomerInput): Promise<Customer>;
  update(id: string, input: UpdateCustomerInput): Promise<Customer>;
}
