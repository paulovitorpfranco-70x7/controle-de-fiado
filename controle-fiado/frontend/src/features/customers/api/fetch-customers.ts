import { httpGet } from "../../../shared/api/http";
import type { Customer } from "../types/customer";

export function fetchCustomers() {
  return httpGet<Customer[]>("/customers");
}
