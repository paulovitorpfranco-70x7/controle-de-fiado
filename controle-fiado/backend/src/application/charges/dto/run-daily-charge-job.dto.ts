export type RunDailyChargeJobResult = {
  processedAt: Date;
  auto3DaysSent: number;
  autoDueDateSent: number;
  skippedDuplicates: number;
};
