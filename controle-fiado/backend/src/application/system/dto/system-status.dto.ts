export type SystemStatus = {
  status: "ok";
  service: string;
  timestamp: Date;
  uptimeSeconds: number;
  auth: {
    ttlSeconds: number;
  };
  database: {
    provider: "sqlite";
  };
  integrations: {
    whatsappProvider: string;
    whatsappMaxRetries: number;
    whatsappRetryDelayMs: number;
    metaPhoneNumberConfigured: boolean;
  };
  scheduler: {
    enabled: boolean;
    scheduleTime: string;
    nextRunAt: Date | null;
  };
  logging: {
    level: string;
  };
};
