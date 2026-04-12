import { prisma } from "../../../../lib/prisma.js";
import type { ChargeMessageRepository } from "../../../../application/ports/charge-message-repository.js";

export class PrismaChargeMessageRepository implements ChargeMessageRepository {
  async list() {
    const messages = await prisma.whatsAppMessage.findMany({
      include: {
        customer: true
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return messages.map(mapMessage);
  }

  async listByCustomer(customerId: string) {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { customerId },
      include: {
        customer: true
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return messages.map(mapMessage);
  }

  async findById(messageId: string) {
    const message = await prisma.whatsAppMessage.findUnique({
      where: {
        id: messageId
      },
      include: {
        customer: true
      }
    });

    return message ? mapMessage(message) : null;
  }

  async findActiveBySaleAndTrigger(input: {
    saleId: string;
    triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  }) {
    const message = await prisma.whatsAppMessage.findFirst({
      where: {
        saleId: input.saleId,
        triggerType: input.triggerType,
        sendStatus: {
          in: ["PENDING", "SENT"]
        }
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return message ? mapMessage(message) : null;
  }

  async findSuccessfulBySaleAndTrigger(input: {
    saleId: string;
    triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
  }) {
    const message = await prisma.whatsAppMessage.findFirst({
      where: {
        saleId: input.saleId,
        triggerType: input.triggerType,
        sendStatus: "SENT"
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return message ? mapMessage(message) : null;
  }

  async updateStatus(input: {
    messageId: string;
    sendStatus: "PENDING" | "SENT" | "FAILED" | "CANCELED";
    providerResponse?: string;
    sentAt?: Date;
  }) {
    const message = await prisma.whatsAppMessage.update({
      where: {
        id: input.messageId
      },
      data: {
        sendStatus: input.sendStatus,
        providerResponse: input.providerResponse,
        sentAt: input.sentAt
      },
      include: {
        customer: true
      }
    });

    return mapMessage(message);
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
      },
      include: {
        customer: true
      }
    });

    return mapMessage(message);
  }
}

function mapMessage(message: {
  id: string;
  customerId: string;
  customer?: {
    name: string;
    phone: string;
    phoneE164: string | null;
  };
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
    customerName: message.customer?.name ?? null,
    phone: message.customer?.phone ?? null,
    phoneE164: message.customer?.phoneE164 ?? null,
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
