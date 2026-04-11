import { env } from "../../../config/env.js";
import type { SystemStatus } from "../dto/system-status.dto.js";

export class GetSystemStatusUseCase {
  constructor(
    private readonly schedulerStatus: {
      enabled: boolean;
      scheduleTime: string;
      nextRunAt: string | null;
    } = {
      enabled: env.enableDailyChargeScheduler,
      scheduleTime: env.dailyChargeScheduleTime,
      nextRunAt: null
    }
  ) {}

  execute(): SystemStatus {
    return {
      status: "ok",
      service: "controle-fiado-api",
      timestamp: new Date(),
      uptimeSeconds: Math.floor(process.uptime()),
      auth: {
        ttlSeconds: env.authTtlSeconds
      },
      database: {
        provider: "sqlite"
      },
      integrations: {
        whatsappProvider: env.whatsappProvider
      },
      scheduler: {
        enabled: this.schedulerStatus.enabled,
        scheduleTime: this.schedulerStatus.scheduleTime,
        nextRunAt: this.schedulerStatus.nextRunAt ? new Date(this.schedulerStatus.nextRunAt) : null
      },
      logging: {
        level: env.logLevel
      }
    };
  }
}
