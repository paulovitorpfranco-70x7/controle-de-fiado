export type WhatsAppMessageRequest = {
  customerId: string;
  phoneE164: string;
  message: string;
  triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
};

export interface WhatsAppProvider {
  sendMessage(input: WhatsAppMessageRequest): Promise<void>;
}
