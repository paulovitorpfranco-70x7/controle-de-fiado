import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import type { GetCurrentUserUseCase } from "../../../../application/auth/use-cases/get-current-user.js";
import type { LoginUseCase } from "../../../../application/auth/use-cases/login.js";
import { loginSchema } from "./auth.schemas.js";

type AuthControllerDeps = {
  loginUseCase: LoginUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
};

export function createAuthController(deps: AuthControllerDeps) {
  return {
    login: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = loginSchema.parse(request.body);
        const result = await deps.loginUseCase.execute(payload);
        return reply.send(result);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({ message: "Dados invalidos para login.", issues: error.issues });
        }

        return reply.code(401).send({ message: error instanceof Error ? error.message : "Falha ao autenticar." });
      }
    },

    me: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await deps.getCurrentUserUseCase.execute(request.headers.authorization);

        if (!user) {
          return reply.code(404).send({ message: "Usuario nao encontrado." });
        }

        return reply.send(user);
      } catch (error) {
        return reply.code(401).send({ message: error instanceof Error ? error.message : "Token invalido." });
      }
    }
  };
}
