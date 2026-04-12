import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import { runSupabaseDailyChargeJob } from "./supabase-charges";

export type DailyChargeJobResult = {
  processedAt: string;
  auto3DaysSent: number;
  autoDueDateSent: number;
  skippedDuplicates: number;
  failedMessages: number;
};

export function runDailyChargeJob() {
  if (isSupabaseDataEnabled()) {
    return runSupabaseDailyChargeJob();
  }

  return httpPost<DailyChargeJobResult>("/charges/jobs/daily", {});
}
