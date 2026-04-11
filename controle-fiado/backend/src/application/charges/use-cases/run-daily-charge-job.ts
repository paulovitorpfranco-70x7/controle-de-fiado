import { integrationError } from "../../errors/app-error.js";
import { buildManualChargeMessage } from "../../../domain/charges/charge.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { ChargeMessageRepository } from "../../ports/charge-message-repository.js";
import type { ChargeOverviewRepository } from "../../ports/charge-overview-repository.js";
import type { WhatsAppProvider } from "../../ports/whatsapp-provider.js";
import type { RunDailyChargeJobResult } from "../dto/run-daily-charge-job.dto.js";

export class RunDailyChargeJobUseCase {
  constructor(
    private readonly chargeOverviewRepository: ChargeOverviewRepository,
    private readonly chargeMessageRepository: ChargeMessageRepository,
    private readonly whatsAppProvider: WhatsAppProvider,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(referenceDate = new Date()): Promise<RunDailyChargeJobResult> {
    try {
      const [dueSoon, dueToday] = await Promise.all([
        this.chargeOverviewRepository.listDueSoon(referenceDate),
        this.chargeOverviewRepository.listDueToday(referenceDate)
      ]);

      let auto3DaysSent = 0;
      let autoDueDateSent = 0;
      let skippedDuplicates = 0;
      let failedMessages = 0;

      for (const item of dueSoon) {
        const sent = await this.processAutomaticCharge(item, "AUTO_3_DAYS");
        if (sent === "sent") auto3DaysSent += 1;
        if (sent === "skipped") skippedDuplicates += 1;
        if (sent === "failed") failedMessages += 1;
      }

      for (const item of dueToday) {
        const sent = await this.processAutomaticCharge(item, "AUTO_DUE_DATE");
        if (sent === "sent") autoDueDateSent += 1;
        if (sent === "skipped") skippedDuplicates += 1;
        if (sent === "failed") failedMessages += 1;
      }

      await this.auditLogService.register({
        action: "daily_charge_job_ran",
        entityType: "job",
        entityId: "daily-charge-job",
        payload: {
          processedAt: referenceDate.toISOString(),
          auto3DaysSent,
          autoDueDateSent,
          skippedDuplicates,
          failedMessages
        }
      });

      return {
        processedAt: referenceDate,
        auto3DaysSent,
        autoDueDateSent,
        skippedDuplicates,
        failedMessages
      };
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "Falha desconhecida no job diario.";

      await this.auditLogService.register({
        action: "daily_charge_job_failed",
        entityType: "job",
        entityId: "daily-charge-job",
        payload: {
          processedAt: referenceDate.toISOString(),
          error: failureMessage
        }
      });

      throw integrationError("Falha ao executar job diario de cobranca.", {
        reason: failureMessage
      });
    }
  }

  private async processAutomaticCharge(
    item: {
      customerId: string;
      customerName: string;
      phoneE164: string | null;
      saleId: string;
      dueDate: Date;
      remainingAmount: number;
    },
    triggerType: "AUTO_3_DAYS" | "AUTO_DUE_DATE"
  ) {
    const existing = await this.chargeMessageRepository.findSuccessfulBySaleAndTrigger({
      saleId: item.saleId,
      triggerType
    });

    if (existing) {
      return "skipped" as const;
    }

    const messageBody = buildManualChargeMessage({
      customerName: item.customerName,
      merchantName: "Mercadinho do Tonhao",
      openBalance: item.remainingAmount,
      dueDate: item.dueDate
    });

    try {
      const providerResult = await this.whatsAppProvider.sendMessage({
        customerId: item.customerId,
        phoneE164: item.phoneE164 ?? "",
        message: messageBody,
        triggerType
      });

      await this.chargeMessageRepository.create({
        customerId: item.customerId,
        saleId: item.saleId,
        triggerType,
        messageBody,
        sendStatus: "SENT",
        providerName: providerResult?.providerName ?? "mock",
        providerMessageId: providerResult?.providerMessageId,
        providerResponse: providerResult?.providerResponse ?? "Mensagem automatica enviada.",
        sentAt: new Date()
      });

      return "sent" as const;
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "Falha desconhecida no provedor.";

      const failedMessage = await this.chargeMessageRepository.create({
        customerId: item.customerId,
        saleId: item.saleId,
        triggerType,
        messageBody,
        sendStatus: "FAILED",
        providerName: "mock",
        providerResponse: failureMessage
      });

      await this.auditLogService.register({
        action: "automatic_charge_failed",
        entityType: "whatsapp_message",
        entityId: failedMessage.id,
        payload: {
          customerId: item.customerId,
          saleId: item.saleId,
          triggerType,
          error: failureMessage
        }
      });

      return "failed" as const;
    }
  }
}
