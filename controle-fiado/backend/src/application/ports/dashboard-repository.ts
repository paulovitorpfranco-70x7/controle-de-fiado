import type { DashboardSummary } from "../dashboard/dto/dashboard-summary.dto.js";

export interface DashboardRepository {
  getSummary(referenceDate?: Date): Promise<DashboardSummary>;
}
