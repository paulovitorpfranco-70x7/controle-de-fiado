import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { authGuard } from "./interfaces/http/auth/auth.guard.js";
import { authRoutes } from "./interfaces/http/modules/auth/auth.routes.js";
import { chargeRoutes } from "./interfaces/http/modules/charges/charge.routes.js";
import { customerRoutes } from "./interfaces/http/modules/customers/customer.routes.js";
import { paymentRoutes } from "./interfaces/http/modules/payments/payment.routes.js";
import { saleRoutes } from "./interfaces/http/modules/sales/sale.routes.js";

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

  app.register(authRoutes, {
    prefix: "/api/auth"
  });

  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", authGuard);

    protectedApp.register(customerRoutes, {
      prefix: "/api/customers"
    });

    protectedApp.register(saleRoutes, {
      prefix: "/api/sales"
    });

    protectedApp.register(paymentRoutes, {
      prefix: "/api/payments"
    });

    protectedApp.register(chargeRoutes, {
      prefix: "/api/charges"
    });
  });

  return app;
}
