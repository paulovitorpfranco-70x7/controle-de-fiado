import type { FastifyReply, FastifyRequest } from "fastify";
import { HmacTokenService } from "../../../infra/auth/hmac-token.service.js";
import { PrismaUserRepository } from "../../../infra/db/prisma/repositories/prisma-user-repository.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: {
      id: string;
      name: string;
      login: string;
      role: "OWNER" | "STAFF";
    };
  }
}

const tokenService = new HmacTokenService();
const userRepository = new PrismaUserRepository();

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return reply.code(401).send({
      message: "Token ausente."
    });
  }

  try {
    const token = authorizationHeader.slice("Bearer ".length);
    const payload = await tokenService.verify(token);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      return reply.code(401).send({
        message: "Usuario autenticado nao encontrado."
      });
    }

    request.authUser = user;
  } catch {
    return reply.code(401).send({
      message: "Token invalido."
    });
  }
}
