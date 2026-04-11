import type { WhatsAppMessageRequest, WhatsAppProvider } from "../../application/ports/whatsapp-provider.js";

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(input: WhatsAppMessageRequest) {
    return Promise.resolve({
      providerName: "mock",
      providerMessageId: `mock-${input.customerId}-${Date.now()}`,
      providerResponse: "Mensagem enviada pelo provedor mock."
    });
  }
}
