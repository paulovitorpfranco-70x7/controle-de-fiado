import { buildManualChargeMessage } from "../../../domain/charges/charge.js";
import { integrationError, notFound } from "../../errors/app-error.js";
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
      throw notFound("Contexto de cobranca nao encontrado.");
    }

    const messageBody =
      input.messageBody ??
      buildManualChargeMessage({
        customerName: context.customerName,
        merchantName: "Mercadinho do Tonhao",
        openBalance: context.remainingAmount,
        dueDate: context.dueDate
      });

    try {
      const providerResult = await this.whatsAppProvider.sendMessage({
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
        providerName: providerResult?.providerName ?? "mock",
        providerMessageId: providerResult?.providerMessageId,
        providerResponse: providerResult?.providerResponse ?? "Mensagem enviada.",
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
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "Falha desconhecida no provedor.";

      const failedMessage = await this.chargeMessageRepository.create({
        customerId: context.customerId,
        saleId: context.saleId,
        triggerType: "MANUAL",
        messageBody,
        sendStatus: "FAILED",
        providerName: "mock",
        providerResponse: failureMessage,
        createdById: input.createdById
      });

      await this.auditLogService.register({
        action: "manual_charge_failed",
        entityType: "whatsapp_message",
        entityId: failedMessage.id,
        actorUserId: input.createdById,
        payload: {
          customerId: context.customerId,
          saleId: context.saleId,
          error: failureMessage
        }
      });

      throw integrationError("Falha ao enviar cobranca pelo provedor.", {
        customerId: context.customerId,
        saleId: context.saleId,
        reason: failureMessage
      });
    }
  }
}
