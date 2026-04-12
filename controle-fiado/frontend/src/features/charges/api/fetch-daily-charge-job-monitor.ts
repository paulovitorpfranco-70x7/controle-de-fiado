import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";
import { fetchSupabaseDailyChargeJobMonitor } from "./supabase-charges";

export function fetchDailyChargeJobMonitor() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseDailyChargeJobMonitor();
  }

  return httpGet<DailyChargeJobMonitor>("/charges/jobs/daily/status");
}
