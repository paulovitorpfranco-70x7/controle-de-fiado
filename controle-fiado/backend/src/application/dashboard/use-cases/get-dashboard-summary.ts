import type { DashboardRepository } from "../../ports/dashboard-repository.js";

export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(referenceDate?: Date) {
    return this.dashboardRepository.getSummary(referenceDate);
  }
}
