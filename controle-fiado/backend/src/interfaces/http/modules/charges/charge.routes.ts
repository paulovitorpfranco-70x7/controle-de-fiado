import type { FastifyInstance } from "fastify";
import { ListChargeMessagesUseCase } from "../../../../application/charges/use-cases/list-charge-messages.js";
import { ListChargeOverviewUseCase } from "../../../../application/charges/use-cases/list-charge-overview.js";
import { SendManualChargeUseCase } from "../../../../application/charges/use-cases/send-manual-charge.js";
import { PrismaChargeMessageRepository } from "../../../../infra/db/prisma/repositories/prisma-charge-message-repository.js";
import { PrismaChargeOverviewRepository } from "../../../../infra/db/prisma/repositories/prisma-charge-overview-repository.js";
import { PrismaAuditLogService } from "../../../../infra/observability/prisma-audit-log.service.js";
import { MockWhatsAppProvider } from "../../../../infra/whatsapp/mock-whatsapp-provider.js";
import { createChargeController } from "./charge.controller.js";

export async function chargeRoutes(app: FastifyInstance) {
  const chargeMessageRepository = new PrismaChargeMessageRepository();
  const chargeOverviewRepository = new PrismaChargeOverviewRepository();
  const whatsAppProvider = new MockWhatsAppProvider();
  const auditLogService = new PrismaAuditLogService();

  const controller = createChargeController({
    listChargeOverviewUseCase: new ListChargeOverviewUseCase(chargeOverviewRepository),
    listChargeMessagesUseCase: new ListChargeMessagesUseCase(chargeMessageRepository),
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
}
