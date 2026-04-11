import type { FastifyInstance } from "fastify";
import { env } from "../../../../config/env.js";
import { GetSystemStatusUseCase } from "../../../../application/system/use-cases/get-system-status.js";
import { createSystemController } from "./system.controller.js";

export async function systemRoutes(app: FastifyInstance) {
  const controller = createSystemController({
    getSystemStatusUseCase: new GetSystemStatusUseCase({
      enabled: env.enableDailyChargeScheduler,
      scheduleTime: env.dailyChargeScheduleTime,
      nextRunAt: app.dailyChargeScheduler?.getStatus().nextRunAt ?? null
    })
  });

  app.get("/status", controller.getStatus);
}
