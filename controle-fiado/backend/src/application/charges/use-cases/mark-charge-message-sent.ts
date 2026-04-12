import { notFound } from "../../errors/app-error.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { ChargeMessageRepository } from "../../ports/charge-message-repository.js";

export class MarkChargeMessageSentUseCase {
  constructor(
    private readonly chargeMessageRepository: ChargeMessageRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: { messageId: string; actorUserId: string }) {
    const message = await this.chargeMessageRepository.findById(input.messageId);

    if (!message) {
      throw notFound("Mensagem nao encontrada.");
    }

    const updated = await this.chargeMessageRepository.updateStatus({
      messageId: input.messageId,
      sendStatus: "SENT",
      providerResponse: "Mensagem marcada como enviada manualmente.",
      sentAt: new Date()
    });

    await this.auditLogService.register({
      action: "charge_marked_sent",
      entityType: "whatsapp_message",
      entityId: updated.id,
      actorUserId: input.actorUserId,
      payload: {
        customerId: updated.customerId,
        saleId: updated.saleId
      }
    });

    return updated;
  }
}
