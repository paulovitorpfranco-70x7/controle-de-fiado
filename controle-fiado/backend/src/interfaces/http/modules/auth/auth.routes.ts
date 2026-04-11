import type { FastifyInstance } from "fastify";
import { GetCurrentUserUseCase } from "../../../../application/auth/use-cases/get-current-user.js";
import { LoginUseCase } from "../../../../application/auth/use-cases/login.js";
import { HmacTokenService } from "../../../../infra/auth/hmac-token.service.js";
import { SimplePasswordHasher } from "../../../../infra/auth/simple-password-hasher.js";
import { PrismaUserRepository } from "../../../../infra/db/prisma/repositories/prisma-user-repository.js";
import { PrismaAuditLogService } from "../../../../infra/observability/prisma-audit-log.service.js";
import { createAuthController } from "./auth.controller.js";

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new SimplePasswordHasher();
  const tokenService = new HmacTokenService();
  const auditLogService = new PrismaAuditLogService();

  const controller = createAuthController({
    loginUseCase: new LoginUseCase(userRepository, passwordHasher, tokenService, auditLogService),
    getCurrentUserUseCase: new GetCurrentUserUseCase(tokenService, userRepository)
  });

  app.post("/login", controller.login);
  app.get("/me", controller.me);
}
