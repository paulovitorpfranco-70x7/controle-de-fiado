import type { DailyChargeJobMonitor } from "../charges/dto/daily-charge-job-monitor.dto.js";

export interface ChargeJobMonitorRepository {
  getDailyJobMonitor(): Promise<DailyChargeJobMonitor>;
}
