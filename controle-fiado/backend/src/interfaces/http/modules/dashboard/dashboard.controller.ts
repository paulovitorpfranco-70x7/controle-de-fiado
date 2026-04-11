import type { FastifyRequest } from "fastify";
import type { GetDashboardSummaryUseCase } from "../../../../application/dashboard/use-cases/get-dashboard-summary.js";

type DashboardControllerDeps = {
  getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
};

export function createDashboardController(deps: DashboardControllerDeps) {
  return {
    getSummary: async (_request: FastifyRequest) => deps.getDashboardSummaryUseCase.execute()
  };
}
