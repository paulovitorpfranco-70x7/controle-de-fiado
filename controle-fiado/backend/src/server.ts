import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { RunDailyChargeJobUseCase } from "./application/charges/use-cases/run-daily-charge-job.js";
import { PrismaChargeMessageRepository } from "./infra/db/prisma/repositories/prisma-charge-message-repository.js";
import { PrismaChargeOverviewRepository } from "./infra/db/prisma/repositories/prisma-charge-overview-repository.js";
import { DailyChargeScheduler } from "./infra/jobs/daily-charge-scheduler.js";
import { PrismaAuditLogService } from "./infra/observability/prisma-audit-log.service.js";
import { buildWhatsAppProvider } from "./infra/whatsapp/build-whatsapp-provider.js";

const app = buildApp();

const dailyChargeScheduler = new DailyChargeScheduler(
  new RunDailyChargeJobUseCase(
    new PrismaChargeOverviewRepository(),
    new PrismaChargeMessageRepository(),
    buildWhatsAppProvider(app.log),
    new PrismaAuditLogService()
  ),
  app.log
);

app.dailyChargeScheduler = dailyChargeScheduler;

async function start() {
  try {
    await app.listen({
      port: env.port,
      host: "0.0.0.0"
    });

    dailyChargeScheduler.start();
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    dailyChargeScheduler.stop();
    await app.close();
    process.exit(0);
  });
}

start();
