import type { FastifyBaseLogger } from "fastify";
import { env } from "../../config/env.js";
import { MetaCloudWhatsAppProvider } from "./meta-cloud-whatsapp-provider.js";
import { MockWhatsAppProvider } from "./mock-whatsapp-provider.js";
import { RetryingWhatsAppProvider } from "./retrying-whatsapp-provider.js";

export function buildWhatsAppProvider(logger?: FastifyBaseLogger) {
  const baseProvider =
    env.whatsappProvider === "meta_cloud" ? new MetaCloudWhatsAppProvider() : new MockWhatsAppProvider();

  return new RetryingWhatsAppProvider(baseProvider, logger);
}
