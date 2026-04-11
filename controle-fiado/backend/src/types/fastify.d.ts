import type { DailyChargeScheduler } from "../infra/jobs/daily-charge-scheduler.js";

declare module "fastify" {
  interface FastifyInstance {
    dailyChargeScheduler?: DailyChargeScheduler;
  }
}
