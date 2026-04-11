import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import type { ListChargeMessagesUseCase } from "../../../../application/charges/use-cases/list-charge-messages.js";
import type { ListChargeOverviewUseCase } from "../../../../application/charges/use-cases/list-charge-overview.js";
import type { RunDailyChargeJobUseCase } from "../../../../application/charges/use-cases/run-daily-charge-job.js";
import type { SendManualChargeUseCase } from "../../../../application/charges/use-cases/send-manual-charge.js";
import { sendManualChargeSchema } from "./charge.schemas.js";

type ChargeControllerDeps = {
  listChargeOverviewUseCase: ListChargeOverviewUseCase;
  listChargeMessagesUseCase: ListChargeMessagesUseCase;
  sendManualChargeUseCase: SendManualChargeUseCase;
  runDailyChargeJobUseCase: RunDailyChargeJobUseCase;
};

export function createChargeController(deps: ChargeControllerDeps) {
  return {
    listOverview: async () => deps.listChargeOverviewUseCase.execute(),

    listMessages: async (request: FastifyRequest) => {
      const query = request.query as { customerId?: string };
      return deps.listChargeMessagesUseCase.execute(query.customerId);
    },

    sendManual: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = sendManualChargeSchema.parse(request.body);
        const result = await deps.sendManualChargeUseCase.execute(payload);
        return reply.code(201).send(result);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({
            message: "Dados invalidos para cobranca manual.",
            issues: error.issues
          });
        }

        throw error;
      }
    },

    runDailyJob: async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await deps.runDailyChargeJobUseCase.execute();
      return reply.send(result);
    }
  };
}
