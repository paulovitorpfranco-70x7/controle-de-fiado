import type { FastifyInstance } from "fastify";
import { createCustomerController } from "./customer.controller.js";
import { CreateCustomerUseCase } from "../../../../application/customers/use-cases/create-customer.js";
import { GetCustomerDetailUseCase } from "../../../../application/customers/use-cases/get-customer-detail.js";
import { ListCustomersUseCase } from "../../../../application/customers/use-cases/list-customers.js";
import { UpdateCustomerUseCase } from "../../../../application/customers/use-cases/update-customer.js";
import { PrismaCustomerDetailRepository } from "../../../../infra/db/prisma/repositories/prisma-customer-detail-repository.js";
import { PrismaCustomerRepository } from "../../../../infra/db/prisma/repositories/prisma-customer-repository.js";
import { NoopAuditLogService } from "../../../../infra/observability/noop-audit-log.service.js";

export async function customerRoutes(app: FastifyInstance) {
  const customerRepository = new PrismaCustomerRepository();
  const customerDetailRepository = new PrismaCustomerDetailRepository();
  const auditLogService = new NoopAuditLogService();

  const controller = createCustomerController({
    listCustomersUseCase: new ListCustomersUseCase(customerRepository),
    getCustomerDetailUseCase: new GetCustomerDetailUseCase(customerDetailRepository),
    createCustomerUseCase: new CreateCustomerUseCase(customerRepository, auditLogService),
    updateCustomerUseCase: new UpdateCustomerUseCase(customerRepository, auditLogService)
  });

  app.get("/", controller.list);
  app.get("/:id", controller.getById);
  app.post("/", controller.create);
  app.patch("/:id", controller.update);
}
