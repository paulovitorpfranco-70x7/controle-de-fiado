import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import type { CreatePaymentUseCase } from "../../../../application/payments/use-cases/create-payment.js";
import type { ListPaymentsUseCase } from "../../../../application/payments/use-cases/list-payments.js";
import { createPaymentSchema } from "./payment.schemas.js";

type PaymentControllerDeps = {
  createPaymentUseCase: CreatePaymentUseCase;
  listPaymentsUseCase: ListPaymentsUseCase;
};

export function createPaymentController(deps: PaymentControllerDeps) {
  return {
    list: async (request: FastifyRequest) => {
      const query = request.query as { customerId?: string };
      return deps.listPaymentsUseCase.execute(query.customerId);
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = createPaymentSchema.parse(request.body);
        const payment = await deps.createPaymentUseCase.execute(payload);
        return reply.code(201).send(payment);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({
            message: "Dados invalidos para pagamento.",
            issues: error.issues
          });
        }

        throw error;
      }
    }
  };
}
