import type { FastifyInstance } from "fastify";
import { GetSystemStatusUseCase } from "../../../../application/system/use-cases/get-system-status.js";
import { createSystemController } from "./system.controller.js";

export async function systemRoutes(app: FastifyInstance) {
  const controller = createSystemController({
    getSystemStatusUseCase: new GetSystemStatusUseCase()
  });

  app.get("/status", controller.getStatus);
}
