export type ChargeMessage = {
  id: string;
  customerId: string;
  saleId: string | null;
  triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  messageBody: string;
  sendStatus: "PENDING" | "SENT" | "FAILED" | "CANCELED";
  providerName: string | null;
  providerMessageId: string | null;
  providerResponse: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  createdById: string | null;
  createdAt: string;
};
