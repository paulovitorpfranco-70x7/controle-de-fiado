import type { FastifyBaseLogger } from "fastify";
import { MockWhatsAppProvider } from "./mock-whatsapp-provider.js";
import { RetryingWhatsAppProvider } from "./retrying-whatsapp-provider.js";

export function buildWhatsAppProvider(logger?: FastifyBaseLogger) {
  return new RetryingWhatsAppProvider(new MockWhatsAppProvider(), logger);
}
