import type { FastifyReply, FastifyRequest } from "fastify";
import type { GetSystemStatusUseCase } from "../../../../application/system/use-cases/get-system-status.js";

type SystemControllerDeps = {
  getSystemStatusUseCase: GetSystemStatusUseCase;
};

export function createSystemController(deps: SystemControllerDeps) {
  return {
    getStatus: async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = deps.getSystemStatusUseCase.execute();
      return reply.send(result);
    }
  };
}
