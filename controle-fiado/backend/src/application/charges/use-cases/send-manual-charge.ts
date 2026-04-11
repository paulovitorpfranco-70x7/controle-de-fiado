import { buildManualChargeMessage } from "../../../domain/charges/charge.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { ChargeMessageRepository } from "../../ports/charge-message-repository.js";
import type { ChargeOverviewRepository } from "../../ports/charge-overview-repository.js";
import type { WhatsAppProvider } from "../../ports/whatsapp-provider.js";
import type { SendManualChargeInput } from "../dto/send-manual-charge.dto.js";

export class SendManualChargeUseCase {
  constructor(
    private readonly chargeOverviewRepository: ChargeOverviewRepository,
    private readonly chargeMessageRepository: ChargeMessageRepository,
    private readonly whatsAppProvider: WhatsAppProvider,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: SendManualChargeInput) {
    const context = await this.chargeOverviewRepository.findCustomerChargeContext(input.customerId, input.saleId);

    if (!context) {
      throw new Error("Contexto de cobranca nao encontrado.");
    }

    const messageBody =
      input.messageBody ??
      buildManualChargeMessage({
        customerName: context.customerName,
        merchantName: "Mercadinho do Tonhao",
        openBalance: context.remainingAmount,
        dueDate: context.dueDate
      });

    await this.whatsAppProvider.sendMessage({
      customerId: context.customerId,
      phoneE164: context.phoneE164 ?? "",
      message: messageBody,
      triggerType: "MANUAL"
    });

    const message = await this.chargeMessageRepository.create({
      customerId: context.customerId,
      saleId: context.saleId,
      triggerType: "MANUAL",
      messageBody,
      sendStatus: "SENT",
      providerName: "mock",
      providerResponse: "Mensagem enviada pelo provedor mock.",
      sentAt: new Date(),
      createdById: input.createdById
    });

    await this.auditLogService.register({
      action: "manual_charge_sent",
      entityType: "whatsapp_message",
      entityId: message.id,
      actorUserId: input.createdById,
      payload: {
        customerId: context.customerId,
        saleId: context.saleId
      }
    });

    return message;
  }
}
