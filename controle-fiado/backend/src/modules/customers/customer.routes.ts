import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { createCustomerSchema, updateCustomerSchema } from "./customer.schemas.js";
import { createCustomer, listCustomers, updateCustomer } from "./customer.service.js";

export async function customerRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return listCustomers();
  });

  app.post("/", async (request, reply) => {
    try {
      const payload = createCustomerSchema.parse(request.body);
      const customer = await createCustomer(payload);
      return reply.code(201).send(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({
          message: "Dados invalidos para cliente.",
          issues: error.issues
        });
      }
      throw error;
    }
  });

  app.patch("/:id", async (request, reply) => {
    try {
      const params = request.params as { id: string };
      const payload = updateCustomerSchema.parse(request.body);
      const customer = await updateCustomer(params.id, payload);
      return reply.send(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({
          message: "Dados invalidos para atualizacao do cliente.",
          issues: error.issues
        });
      }
      throw error;
    }
  });
}

