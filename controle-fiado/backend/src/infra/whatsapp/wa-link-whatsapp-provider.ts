import { integrationError } from "../../application/errors/app-error.js";
import type {
  WhatsAppMessageRequest,
  WhatsAppMessageResponse,
  WhatsAppProvider
} from "../../application/ports/whatsapp-provider.js";

export class WaLinkWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(input: WhatsAppMessageRequest): Promise<WhatsAppMessageResponse> {
    if (!input.phoneE164) {
      throw integrationError("Cliente sem telefone valido para abrir WhatsApp.", {
        customerId: input.customerId
      });
    }

    return {
      providerName: "wa_link",
      providerResponse: "Link do WhatsApp gerado para envio manual.",
      dispatchStatus: "PENDING",
      openUrl: buildWhatsAppUrl(input.phoneE164, input.message)
    };
  }
}

export function buildWhatsAppUrl(phoneE164: string, message: string) {
  const normalizedPhone = phoneE164.replace(/[^\d]/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
