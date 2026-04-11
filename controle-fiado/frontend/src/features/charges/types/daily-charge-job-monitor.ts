export type DailyChargeJobMonitor = {
  lastRunAt: string | null;
  lastRunStatus: "success" | "failed" | "never";
  lastRunSummary: Record<string, unknown> | null;
  failedMessagesTotal: number;
  failedMessagesLast7Days: number;
  lastFailureAt: string | null;
  lastFailureMessage: string | null;
};
