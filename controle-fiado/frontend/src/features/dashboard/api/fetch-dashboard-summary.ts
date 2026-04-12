import { httpGet } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { DashboardSummary } from "../types/dashboard-summary";
import { fetchSupabaseDashboardSummary } from "./supabase-dashboard";

export function fetchDashboardSummary() {
  if (isSupabaseDataEnabled()) {
    return fetchSupabaseDashboardSummary();
  }

  return httpGet<DashboardSummary>("/dashboard/summary");
}
