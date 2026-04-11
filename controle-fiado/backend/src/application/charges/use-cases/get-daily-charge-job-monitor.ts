import type { ChargeJobMonitorRepository } from "../../ports/charge-job-monitor-repository.js";

export class GetDailyChargeJobMonitorUseCase {
  constructor(private readonly chargeJobMonitorRepository: ChargeJobMonitorRepository) {}

  async execute() {
    return this.chargeJobMonitorRepository.getDailyJobMonitor();
  }
}
