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
  whatsappProvider: getEnv("WHATSAPP_PROVIDER", "mock")
};

