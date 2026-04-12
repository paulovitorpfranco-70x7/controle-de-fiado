import type { ChargeMessage } from "../../domain/charges/charge.js";

export interface ChargeMessageRepository {
  list(): Promise<ChargeMessage[]>;
  listByCustomer(customerId: string): Promise<ChargeMessage[]>;
  findById(messageId: string): Promise<ChargeMessage | null>;
  findActiveBySaleAndTrigger(input: {
    saleId: string;
    triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  }): Promise<ChargeMessage | null>;
  findSuccessfulBySaleAndTrigger(input: {
    saleId: string;
    triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  }): Promise<ChargeMessage | null>;
  updateStatus(input: {
    messageId: string;
    sendStatus: "PENDING" | "SENT" | "FAILED" | "CANCELED";
    providerResponse?: string;
    sentAt?: Date;
  }): Promise<ChargeMessage>;
  create(input: {
    customerId: string;
    saleId?: string;
    triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
    messageBody: string;
    sendStatus: "PENDING" | "SENT" | "FAILED" | "CANCELED";
    providerName?: string;
    providerMessageId?: string;
    providerResponse?: string;
    scheduledFor?: Date;
    sentAt?: Date;
    createdById?: string;
  }): Promise<ChargeMessage>;
}
