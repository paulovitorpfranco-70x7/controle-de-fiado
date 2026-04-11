import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import type { CreateSaleUseCase } from "../../../../application/sales/use-cases/create-sale.js";
import type { ListSalesUseCase } from "../../../../application/sales/use-cases/list-sales.js";
import { createSaleSchema } from "./sale.schemas.js";

type SaleControllerDeps = {
  createSaleUseCase: CreateSaleUseCase;
  listSalesUseCase: ListSalesUseCase;
};

export function createSaleController(deps: SaleControllerDeps) {
  return {
    list: async (request: FastifyRequest) => {
      const query = request.query as { customerId?: string };
      return deps.listSalesUseCase.execute(query.customerId);
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = createSaleSchema.parse(request.body);
        const sale = await deps.createSaleUseCase.execute(payload);
        return reply.code(201).send(sale);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({
            message: "Dados invalidos para venda.",
            issues: error.issues
          });
        }

        throw error;
      }
    }
  };
}
