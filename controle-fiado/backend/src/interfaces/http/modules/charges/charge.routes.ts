import type { FastifyInstance } from "fastify";
import { GetDailyChargeJobMonitorUseCase } from "../../../../application/charges/use-cases/get-daily-charge-job-monitor.js";
import { ListChargeMessagesUseCase } from "../../../../application/charges/use-cases/list-charge-messages.js";
import { ListChargeOverviewUseCase } from "../../../../application/charges/use-cases/list-charge-overview.js";
import { RetryFailedChargeUseCase } from "../../../../application/charges/use-cases/retry-failed-charge.js";
import { RunDailyChargeJobUseCase } from "../../../../application/charges/use-cases/run-daily-charge-job.js";
import { SendManualChargeUseCase } from "../../../../application/charges/use-cases/send-manual-charge.js";
import { PrismaChargeJobMonitorRepository } from "../../../../infra/db/prisma/repositories/prisma-charge-job-monitor-repository.js";
import { PrismaChargeMessageRepository } from "../../../../infra/db/prisma/repositories/prisma-charge-message-repository.js";
import { PrismaChargeOverviewRepository } from "../../../../infra/db/prisma/repositories/prisma-charge-overview-repository.js";
import { PrismaAuditLogService } from "../../../../infra/observability/prisma-audit-log.service.js";
import { MockWhatsAppProvider } from "../../../../infra/whatsapp/mock-whatsapp-provider.js";
import { requireRole } from "../../auth/role.guard.js";
import { createChargeController } from "./charge.controller.js";

export async function chargeRoutes(app: FastifyInstance) {
  const chargeMessageRepository = new PrismaChargeMessageRepository();
  const chargeOverviewRepository = new PrismaChargeOverviewRepository();
  const chargeJobMonitorRepository = new PrismaChargeJobMonitorRepository();
  const whatsAppProvider = new MockWhatsAppProvider();
  const auditLogService = new PrismaAuditLogService();

  const controller = createChargeController({
    listChargeOverviewUseCase: new ListChargeOverviewUseCase(chargeOverviewRepository),
    listChargeMessagesUseCase: new ListChargeMessagesUseCase(chargeMessageRepository),
    runDailyChargeJobUseCase: new RunDailyChargeJobUseCase(
      chargeOverviewRepository,
      chargeMessageRepository,
      whatsAppProvider,
      auditLogService
    ),
    getDailyChargeJobMonitorUseCase: new GetDailyChargeJobMonitorUseCase(chargeJobMonitorRepository),
    retryFailedChargeUseCase: new RetryFailedChargeUseCase(
      chargeMessageRepository,
      chargeOverviewRepository,
      whatsAppProvider,
      auditLogService
    ),
    sendManualChargeUseCase: new SendManualChargeUseCase(
      chargeOverviewRepository,
      chargeMessageRepository,
      whatsAppProvider,
      auditLogService
    )
  });

  app.get("/overview", controller.listOverview);
  app.get("/messages", controller.listMessages);
  app.post("/messages/manual", controller.sendManual);
  app.post("/messages/:id/retry", controller.retryFailed);
  app.get("/jobs/daily/status", controller.getDailyJobMonitor);
  app.post("/jobs/daily", { preHandler: requireRole("OWNER") }, controller.runDailyJob);
}
