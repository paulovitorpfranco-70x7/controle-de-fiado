import "dotenv/config";

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(getEnv("PORT", "3333")),
  corsOrigin: getEnv("CORS_ORIGIN", "http://127.0.0.1:5173"),
  whatsappProvider: getEnv("WHATSAPP_PROVIDER", "wa_link"),
  metaWhatsAppApiVersion: getEnv("META_WHATSAPP_API_VERSION", "v23.0"),
  metaWhatsAppAccessToken: getEnv("META_WHATSAPP_ACCESS_TOKEN", ""),
  metaWhatsAppPhoneNumberId: getEnv("META_WHATSAPP_PHONE_NUMBER_ID", ""),
  authSecret: getEnv("AUTH_SECRET", "dev-secret-change-me"),
  logLevel: getEnv("LOG_LEVEL", "info"),
  authTtlSeconds: Number(getEnv("AUTH_TTL_SECONDS", "28800")),
  enableDailyChargeScheduler: getEnv("ENABLE_DAILY_CHARGE_SCHEDULER", "false") === "true",
  dailyChargeScheduleTime: getEnv("DAILY_CHARGE_SCHEDULE_TIME", "09:00"),
  whatsappMaxRetries: Number(getEnv("WHATSAPP_MAX_RETRIES", "2")),
  whatsappRetryDelayMs: Number(getEnv("WHATSAPP_RETRY_DELAY_MS", "1500"))
};
