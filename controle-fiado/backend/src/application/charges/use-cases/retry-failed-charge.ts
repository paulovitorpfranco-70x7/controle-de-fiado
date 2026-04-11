import { integrationError, notFound } from "../../errors/app-error.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { ChargeMessageRepository } from "../../ports/charge-message-repository.js";
import type { ChargeOverviewRepository } from "../../ports/charge-overview-repository.js";
import type { WhatsAppProvider } from "../../ports/whatsapp-provider.js";
import type { RetryFailedChargeInput } from "../dto/retry-failed-charge.dto.js";

export class RetryFailedChargeUseCase {
  constructor(
    private readonly chargeMessageRepository: ChargeMessageRepository,
    private readonly chargeOverviewRepository: ChargeOverviewRepository,
    private readonly whatsAppProvider: WhatsAppProvider,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: RetryFailedChargeInput) {
    const failedMessage = await this.chargeMessageRepository.findById(input.messageId);

    if (!failedMessage || failedMessage.sendStatus !== "FAILED") {
      throw notFound("Mensagem com falha nao encontrada para reenvio.");
    }

    const context = await this.chargeOverviewRepository.findCustomerChargeContext(
      failedMessage.customerId,
      failedMessage.saleId ?? undefined
    );

    if (!context) {
      throw notFound("Contexto de cobranca nao encontrado para reenvio.");
    }

    try {
      const providerResult = await this.whatsAppProvider.sendMessage({
        customerId: failedMessage.customerId,
        phoneE164: context.phoneE164 ?? "",
        message: failedMessage.messageBody,
        triggerType: failedMessage.triggerType
      });

      const resentMessage = await this.chargeMessageRepository.create({
        customerId: failedMessage.customerId,
        saleId: failedMessage.saleId ?? undefined,
        triggerType: failedMessage.triggerType,
        messageBody: failedMessage.messageBody,
        sendStatus: "SENT",
        providerName: providerResult?.providerName ?? "mock",
        providerMessageId: providerResult?.providerMessageId,
        providerResponse: providerResult?.providerResponse ?? "Mensagem reenviada.",
        sentAt: new Date(),
        createdById: input.createdById
      });

      await this.auditLogService.register({
        action: "failed_charge_resent",
        entityType: "whatsapp_message",
        entityId: resentMessage.id,
        actorUserId: input.createdById,
        payload: {
          originalMessageId: failedMessage.id,
          customerId: failedMessage.customerId,
          saleId: failedMessage.saleId
        }
      });

      return resentMessage;
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "Falha desconhecida no provedor.";

      const retriedFailure = await this.chargeMessageRepository.create({
        customerId: failedMessage.customerId,
        saleId: failedMessage.saleId ?? undefined,
        triggerType: failedMessage.triggerType,
        messageBody: failedMessage.messageBody,
        sendStatus: "FAILED",
        providerName: "mock",
        providerResponse: failureMessage,
        createdById: input.createdById
      });

      await this.auditLogService.register({
        action: "failed_charge_resend_failed",
        entityType: "whatsapp_message",
        entityId: retriedFailure.id,
        actorUserId: input.createdById,
        payload: {
          originalMessageId: failedMessage.id,
          customerId: failedMessage.customerId,
          saleId: failedMessage.saleId,
          error: failureMessage
        }
      });

      throw integrationError("Falha ao reenviar cobranca.", {
        originalMessageId: failedMessage.id,
        reason: failureMessage
      });
    }
  }
}
