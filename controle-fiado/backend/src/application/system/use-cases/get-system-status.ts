import { env } from "../../../config/env.js";
import type { SystemStatus } from "../dto/system-status.dto.js";

export class GetSystemStatusUseCase {
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
      logging: {
        level: env.logLevel
      }
    };
  }
}
