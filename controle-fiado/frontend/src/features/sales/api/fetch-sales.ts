import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Sale } from "../types/sale";
import { fetchSupabaseSales } from "./supabase-sales";

export function fetchSales() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseSales();
  }

  return httpGet<Sale[]>("/sales");
}
