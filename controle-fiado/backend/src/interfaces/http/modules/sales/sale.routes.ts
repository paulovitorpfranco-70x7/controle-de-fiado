import type { FastifyInstance } from "fastify";
import { CreateSaleUseCase } from "../../../../application/sales/use-cases/create-sale.js";
import { ListSalesUseCase } from "../../../../application/sales/use-cases/list-sales.js";
import { PrismaSaleRepository } from "../../../../infra/db/prisma/repositories/prisma-sale-repository.js";
import { PrismaAuditLogService } from "../../../../infra/observability/prisma-audit-log.service.js";
import { createSaleController } from "./sale.controller.js";

export async function saleRoutes(app: FastifyInstance) {
  const saleRepository = new PrismaSaleRepository();
  const auditLogService = new PrismaAuditLogService();

  const controller = createSaleController({
    listSalesUseCase: new ListSalesUseCase(saleRepository),
    createSaleUseCase: new CreateSaleUseCase(saleRepository, auditLogService)
  });

  app.get("/", controller.list);
  app.post("/", controller.create);
}
