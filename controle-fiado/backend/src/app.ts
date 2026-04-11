import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { customerRoutes } from "./interfaces/http/modules/customers/customer.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: env.corsOrigin
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "controle-fiado-api"
  }));

  app.get("/api", async () => ({
    message: "Controle de Fiado API"
  }));

  app.register(customerRoutes, {
    prefix: "/api/customers"
  });

  return app;
}
