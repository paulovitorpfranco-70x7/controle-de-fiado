import { integrationError } from "../../application/errors/app-error.js";
import { env } from "../../config/env.js";
import type {
  WhatsAppMessageRequest,
  WhatsAppMessageResponse,
  WhatsAppProvider
} from "../../application/ports/whatsapp-provider.js";

type FetchLike = typeof fetch;

export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly fetchImpl: FetchLike = fetch,
    private readonly config = {
      accessToken: env.metaWhatsAppAccessToken,
      phoneNumberId: env.metaWhatsAppPhoneNumberId,
      apiVersion: env.metaWhatsAppApiVersion
    }
  ) {}

  async sendMessage(input: WhatsAppMessageRequest): Promise<WhatsAppMessageResponse> {
    if (!this.config.accessToken || !this.config.phoneNumberId) {
      throw integrationError("Meta Cloud API nao configurada.", {
        missingAccessToken: !this.config.accessToken,
        missingPhoneNumberId: !this.config.phoneNumberId
      });
    }

    const response = await this.fetchImpl(
      `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalizePhone(input.phoneE164),
          type: "text",
          text: {
            body: input.message,
            preview_url: false
          }
        })
      }
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          messages?: Array<{ id?: string }>;
          error?: { message?: string; code?: number; error_subcode?: number };
        }
      | null;

    if (!response.ok) {
      throw integrationError("Falha ao enviar mensagem pela Meta Cloud API.", {
        statusCode: response.status,
        provider: "meta_cloud",
        providerError: payload?.error?.message ?? "unknown",
        providerCode: payload?.error?.code,
        providerSubcode: payload?.error?.error_subcode
      });
    }

    return {
      providerName: "meta_cloud",
      providerMessageId: payload?.messages?.[0]?.id,
      providerResponse: "Mensagem enviada pela Meta Cloud API."
    };
  }
}

function normalizePhone(phoneE164: string) {
  return phoneE164.replace(/[^\d]/g, "");
}
