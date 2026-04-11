import { httpGet } from "../../../shared/api/http";
import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";

export function fetchDailyChargeJobMonitor() {
  return httpGet<DailyChargeJobMonitor>("/charges/jobs/daily/status");
}
