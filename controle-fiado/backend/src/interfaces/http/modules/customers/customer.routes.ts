import type { FastifyInstance } from "fastify";
import { createCustomerController } from "./customer.controller.js";
import { CreateCustomerUseCase } from "../../../../application/customers/use-cases/create-customer.js";
import { ListCustomersUseCase } from "../../../../application/customers/use-cases/list-customers.js";
import { UpdateCustomerUseCase } from "../../../../application/customers/use-cases/update-customer.js";
import { PrismaCustomerRepository } from "../../../../infra/db/prisma/repositories/prisma-customer-repository.js";
import { NoopAuditLogService } from "../../../../infra/observability/noop-audit-log.service.js";

export async function customerRoutes(app: FastifyInstance) {
  const customerRepository = new PrismaCustomerRepository();
  const auditLogService = new NoopAuditLogService();

  const controller = createCustomerController({
    listCustomersUseCase: new ListCustomersUseCase(customerRepository),
    createCustomerUseCase: new CreateCustomerUseCase(customerRepository, auditLogService),
    updateCustomerUseCase: new UpdateCustomerUseCase(customerRepository, auditLogService)
  });

  app.get("/", controller.list);
  app.post("/", controller.create);
  app.patch("/:id", controller.update);
}
