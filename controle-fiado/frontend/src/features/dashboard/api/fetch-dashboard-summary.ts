import { httpGet } from "../../../shared/api/http";
import type { DashboardSummary } from "../types/dashboard-summary";

export function fetchDashboardSummary() {
  return httpGet<DashboardSummary>("/dashboard/summary");
}
