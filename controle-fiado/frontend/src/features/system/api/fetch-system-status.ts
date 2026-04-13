import { httpGet } from "../../../shared/api/http";
import { isSupabaseAuthEnabled } from "../../../shared/config/auth";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { SystemStatus } from "../types/system-status";

export function fetchSystemStatus() {
  if (isSupabaseAuthEnabled() || isSupabaseDataEnabled()) {
    return Promise.resolve<SystemStatus>({
      status: "ok",
      service: "frontend + supabase",
      timestamp: new Date().toISOString(),
      uptimeSeconds: 0,
      auth: {
        ttlSeconds: 0
      },
      database: {
        provider: "supabase"
      },
      integrations: {
        whatsappProvider: "wa_link",
        whatsappMaxRetries: 0,
        whatsappRetryDelayMs: 0,
        metaPhoneNumberConfigured: false
      },
      scheduler: {
        enabled: true,
        scheduleTime: "Supabase",
        nextRunAt: null
      },
      logging: {
        level: "managed"
      }
    });
  }

  return httpGet<SystemStatus>("/system/status");
}
