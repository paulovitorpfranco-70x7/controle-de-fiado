import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Sale } from "../types/sale";
import { normalizeSale } from "../utils/sale-items";
import { fetchSupabaseSales } from "./supabase-sales";

export function fetchSales() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseSales();
  }

  return httpGet<Sale[]>("/sales").then((sales) => sales.map(normalizeSale));
}
