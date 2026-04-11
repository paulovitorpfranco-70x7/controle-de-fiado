import { ZodError } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createCustomerSchema, updateCustomerSchema } from "./customer.schemas.js";
import type { CreateCustomerUseCase } from "../../../../application/customers/use-cases/create-customer.js";
import type { ListCustomersUseCase } from "../../../../application/customers/use-cases/list-customers.js";
import type { UpdateCustomerUseCase } from "../../../../application/customers/use-cases/update-customer.js";

type CustomerControllerDeps = {
  listCustomersUseCase: ListCustomersUseCase;
  createCustomerUseCase: CreateCustomerUseCase;
  updateCustomerUseCase: UpdateCustomerUseCase;
};

export function createCustomerController(deps: CustomerControllerDeps) {
  return {
    list: async () => deps.listCustomersUseCase.execute(),

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = createCustomerSchema.parse(request.body);
        const customer = await deps.createCustomerUseCase.execute(payload);
        return reply.code(201).send(customer);
      } catch (error) {
        return handleValidationError(error, reply, "Dados invalidos para cliente.");
      }
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { id: string };
        const payload = updateCustomerSchema.parse(request.body);
        const customer = await deps.updateCustomerUseCase.execute(params.id, payload);
        return reply.send(customer);
      } catch (error) {
        return handleValidationError(error, reply, "Dados invalidos para atualizacao do cliente.");
      }
    }
  };
}

function handleValidationError(error: unknown, reply: FastifyReply, message: string) {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      message,
      issues: error.issues
    });
  }

  throw error;
}
