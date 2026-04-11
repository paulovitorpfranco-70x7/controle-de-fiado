import { prisma } from "../../../../lib/prisma.js";
import type { ChargeMessageRepository } from "../../../../application/ports/charge-message-repository.js";

export class PrismaChargeMessageRepository implements ChargeMessageRepository {
  async list() {
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: [{ createdAt: "desc" }]
    });

    return messages.map(mapMessage);
  }

  async listByCustomer(customerId: string) {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { customerId },
      orderBy: [{ createdAt: "desc" }]
    });

    return messages.map(mapMessage);
  }

  async create(input: {
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
  }) {
    const message = await prisma.whatsAppMessage.create({
      data: {
        customerId: input.customerId,
        saleId: input.saleId,
        triggerType: input.triggerType,
        messageBody: input.messageBody,
        sendStatus: input.sendStatus,
        providerName: input.providerName,
        providerMessageId: input.providerMessageId,
        providerResponse: input.providerResponse,
        scheduledFor: input.scheduledFor,
        sentAt: input.sentAt,
        createdById: input.createdById
      }
    });

    return mapMessage(message);
  }
}

function mapMessage(message: {
  id: string;
  customerId: string;
  saleId: string | null;
  triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  messageBody: string;
  sendStatus: "PENDING" | "SENT" | "FAILED" | "CANCELED";
  providerName: string | null;
  providerMessageId: string | null;
  providerResponse: string | null;
  scheduledFor: Date | null;
  sentAt: Date | null;
  createdById: string | null;
  createdAt: Date;
}) {
  return {
    id: message.id,
    customerId: message.customerId,
    saleId: message.saleId,
    triggerType: message.triggerType,
    messageBody: message.messageBody,
    sendStatus: message.sendStatus,
    providerName: message.providerName,
    providerMessageId: message.providerMessageId,
    providerResponse: message.providerResponse,
    scheduledFor: message.scheduledFor,
    sentAt: message.sentAt,
    createdById: message.createdById,
    createdAt: message.createdAt
  };
}
