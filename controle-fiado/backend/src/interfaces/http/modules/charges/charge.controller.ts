import type { FastifyReply, FastifyRequest } from "fastify";
import type { GetDailyChargeJobMonitorUseCase } from "../../../../application/charges/use-cases/get-daily-charge-job-monitor.js";
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
  getDailyChargeJobMonitorUseCase: GetDailyChargeJobMonitorUseCase;
};

export function createChargeController(deps: ChargeControllerDeps) {
  return {
    listOverview: async () => deps.listChargeOverviewUseCase.execute(),

    listMessages: async (request: FastifyRequest) => {
      const query = request.query as { customerId?: string };
      return deps.listChargeMessagesUseCase.execute(query.customerId);
    },

    sendManual: async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = sendManualChargeSchema.parse(request.body);
      const result = await deps.sendManualChargeUseCase.execute(payload);
      return reply.code(201).send(result);
    },

    runDailyJob: async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await deps.runDailyChargeJobUseCase.execute();
      return reply.send(result);
    },

    getDailyJobMonitor: async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await deps.getDailyChargeJobMonitorUseCase.execute();
      return reply.send(result);
    }
  };
}
