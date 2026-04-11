import type { FastifyReply, FastifyRequest } from "fastify";
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
      const payload = loginSchema.parse(request.body);
      const result = await deps.loginUseCase.execute(payload);
      return reply.send(result);
    },

    me: async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await deps.getCurrentUserUseCase.execute(request.headers.authorization);
      return reply.send(user);
    }
  };
}
