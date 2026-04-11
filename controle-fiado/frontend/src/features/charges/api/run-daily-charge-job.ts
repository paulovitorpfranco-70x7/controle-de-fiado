import { httpPost } from "../../../shared/api/http";

export type DailyChargeJobResult = {
  processedAt: string;
  auto3DaysSent: number;
  autoDueDateSent: number;
  skippedDuplicates: number;
  failedMessages: number;
};

export function runDailyChargeJob() {
  return httpPost<DailyChargeJobResult>("/charges/jobs/daily", {});
}
