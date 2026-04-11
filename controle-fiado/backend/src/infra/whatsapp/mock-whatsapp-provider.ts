import type { WhatsAppMessageRequest, WhatsAppProvider } from "../../application/ports/whatsapp-provider.js";

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(_input: WhatsAppMessageRequest) {
    return Promise.resolve();
  }
}
