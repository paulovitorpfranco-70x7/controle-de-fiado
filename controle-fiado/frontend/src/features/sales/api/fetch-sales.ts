import { httpGet } from "../../../shared/api/http";
import type { Sale } from "../types/sale";

export function fetchSales() {
  return httpGet<Sale[]>("/sales");
}
