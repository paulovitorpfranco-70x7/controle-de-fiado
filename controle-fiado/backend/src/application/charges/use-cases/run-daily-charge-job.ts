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
    const [dueSoon, dueToday] = await Promise.all([
      this.chargeOverviewRepository.listDueSoon(referenceDate),
      this.chargeOverviewRepository.listDueToday(referenceDate)
    ]);

    let auto3DaysSent = 0;
    let autoDueDateSent = 0;
    let skippedDuplicates = 0;

    for (const item of dueSoon) {
      const sent = await this.processAutomaticCharge(item, "AUTO_3_DAYS");
      if (sent === "sent") auto3DaysSent += 1;
      if (sent === "skipped") skippedDuplicates += 1;
    }

    for (const item of dueToday) {
      const sent = await this.processAutomaticCharge(item, "AUTO_DUE_DATE");
      if (sent === "sent") autoDueDateSent += 1;
      if (sent === "skipped") skippedDuplicates += 1;
    }

    await this.auditLogService.register({
      action: "daily_charge_job_ran",
      entityType: "job",
      entityId: "daily-charge-job",
      payload: {
        processedAt: referenceDate.toISOString(),
        auto3DaysSent,
        autoDueDateSent,
        skippedDuplicates
      }
    });

    return {
      processedAt: referenceDate,
      auto3DaysSent,
      autoDueDateSent,
      skippedDuplicates
    };
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

    await this.whatsAppProvider.sendMessage({
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
      providerName: "mock",
      providerResponse: "Mensagem automatica enviada pelo provedor mock.",
      sentAt: new Date()
    });

    return "sent" as const;
  }
}
