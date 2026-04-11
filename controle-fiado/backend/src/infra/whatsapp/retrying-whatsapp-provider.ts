import { env } from "../../config/env.js";
import type {
  WhatsAppMessageRequest,
  WhatsAppMessageResponse,
  WhatsAppProvider
} from "../../application/ports/whatsapp-provider.js";

type RetryLogger = {
  warn: (payload: Record<string, unknown>, message?: string) => void;
};

export class RetryingWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly provider: WhatsAppProvider,
    private readonly logger?: RetryLogger,
    private readonly maxRetries = env.whatsappMaxRetries,
    private readonly retryDelayMs = env.whatsappRetryDelayMs
  ) {}

  async sendMessage(input: WhatsAppMessageRequest): Promise<WhatsAppMessageResponse | void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt += 1) {
      try {
        return await this.provider.sendMessage(input);
      } catch (error) {
        lastError = error;

        if (attempt > this.maxRetries) {
          break;
        }

        this.logger?.warn(
          {
            event: "whatsapp_send_retry_scheduled",
            customerId: input.customerId,
            triggerType: input.triggerType,
            attempt,
            nextAttempt: attempt + 1,
            retryDelayMs: this.retryDelayMs,
            error: error instanceof Error ? error.message : "unknown"
          },
          "Retrying WhatsApp send."
        );

        await delay(this.retryDelayMs);
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Falha ao enviar mensagem pelo WhatsApp.");
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
