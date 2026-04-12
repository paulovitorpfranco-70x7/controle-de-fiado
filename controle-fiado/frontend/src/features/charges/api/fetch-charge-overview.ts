import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { ChargeOverview } from "../types/charge-overview";
import { fetchSupabaseChargeOverview } from "./supabase-charges";

export function fetchChargeOverview() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseChargeOverview();
  }

  return httpGet<ChargeOverview>("/charges/overview");
}
