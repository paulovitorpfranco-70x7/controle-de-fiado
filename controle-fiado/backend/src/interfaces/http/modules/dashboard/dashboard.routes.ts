import type { FastifyInstance } from "fastify";
import { GetDashboardSummaryUseCase } from "../../../../application/dashboard/use-cases/get-dashboard-summary.js";
import { PrismaDashboardRepository } from "../../../../infra/db/prisma/repositories/prisma-dashboard-repository.js";
import { createDashboardController } from "./dashboard.controller.js";

export async function dashboardRoutes(app: FastifyInstance) {
  const dashboardRepository = new PrismaDashboardRepository();
  const controller = createDashboardController({
    getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(dashboardRepository)
  });

  app.get("/summary", controller.getSummary);
}
