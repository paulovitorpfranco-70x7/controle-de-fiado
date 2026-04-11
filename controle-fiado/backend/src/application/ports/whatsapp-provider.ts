export type WhatsAppMessageRequest = {
  customerId: string;
  phoneE164: string;
  message: string;
  triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
};

export type WhatsAppMessageResponse = {
  providerName?: string;
  providerMessageId?: string;
  providerResponse?: string;
};

export interface WhatsAppProvider {
  sendMessage(input: WhatsAppMessageRequest): Promise<WhatsAppMessageResponse | void>;
}
