import type { FastifyInstance } from "fastify";
import { CreatePaymentUseCase } from "../../../../application/payments/use-cases/create-payment.js";
import { ListPaymentsUseCase } from "../../../../application/payments/use-cases/list-payments.js";
import { PrismaPaymentRepository } from "../../../../infra/db/prisma/repositories/prisma-payment-repository.js";
import { PrismaSaleBalanceRepository } from "../../../../infra/db/prisma/repositories/prisma-sale-balance-repository.js";
import { NoopAuditLogService } from "../../../../infra/observability/noop-audit-log.service.js";
import { createPaymentController } from "./payment.controller.js";

export async function paymentRoutes(app: FastifyInstance) {
  const paymentRepository = new PrismaPaymentRepository();
  const saleBalanceRepository = new PrismaSaleBalanceRepository();
  const auditLogService = new NoopAuditLogService();

  const controller = createPaymentController({
    listPaymentsUseCase: new ListPaymentsUseCase(paymentRepository),
    createPaymentUseCase: new CreatePaymentUseCase(saleBalanceRepository, paymentRepository, auditLogService)
  });

  app.get("/", controller.list);
  app.post("/", controller.create);
}
