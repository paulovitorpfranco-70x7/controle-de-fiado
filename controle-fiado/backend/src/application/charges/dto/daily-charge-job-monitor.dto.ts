export type DailyChargeJobMonitor = {
  lastRunAt: Date | null;
  lastRunStatus: "success" | "failed" | "never";
  lastRunSummary: Record<string, unknown> | null;
  failedMessagesTotal: number;
  failedMessagesLast7Days: number;
  lastFailureAt: Date | null;
  lastFailureMessage: string | null;
};
