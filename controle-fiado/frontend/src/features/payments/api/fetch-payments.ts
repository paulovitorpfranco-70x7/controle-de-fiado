import { httpGet } from "../../../shared/api/http";
import type { Payment } from "../types/payment";

export function fetchPayments() {
  return httpGet<Payment[]>("/payments");
}
