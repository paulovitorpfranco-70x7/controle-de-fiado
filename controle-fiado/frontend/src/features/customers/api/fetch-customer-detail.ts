import { httpGet } from "../../../shared/api/http";
import type { CustomerDetail } from "../types/customer-detail";

export function fetchCustomerDetail(customerId: string) {
  return httpGet<CustomerDetail>(`/customers/${customerId}`);
}
