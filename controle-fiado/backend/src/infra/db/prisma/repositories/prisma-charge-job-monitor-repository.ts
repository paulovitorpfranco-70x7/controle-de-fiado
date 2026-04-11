import { prisma } from "../../../../lib/prisma.js";
import type { DailyChargeJobMonitor } from "../../../../application/charges/dto/daily-charge-job-monitor.dto.js";
import type { ChargeJobMonitorRepository } from "../../../../application/ports/charge-job-monitor-repository.js";

export class PrismaChargeJobMonitorRepository implements ChargeJobMonitorRepository {
  async getDailyJobMonitor(): Promise<DailyChargeJobMonitor> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentJobAudits, failedMessagesTotal, failedMessagesLast7Days, latestFailedMessage] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          entityType: "job",
          entityId: "daily-charge-job",
          action: {
            in: ["daily_charge_job_ran", "daily_charge_job_failed"]
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }),
      prisma.whatsAppMessage.count({
        where: {
          sendStatus: "FAILED"
        }
      }),
      prisma.whatsAppMessage.count({
        where: {
          sendStatus: "FAILED",
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.whatsAppMessage.findFirst({
        where: {
          sendStatus: "FAILED"
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);

    const lastJobAudit = recentJobAudits[0] ?? null;
    const lastRunStatus: DailyChargeJobMonitor["lastRunStatus"] =
      lastJobAudit?.action === "daily_charge_job_ran"
        ? "success"
        : lastJobAudit?.action === "daily_charge_job_failed"
          ? "failed"
          : "never";

    return {
      lastRunAt: lastJobAudit?.createdAt ?? null,
      lastRunStatus,
      lastRunSummary: parsePayload(lastJobAudit?.payloadJson),
      failedMessagesTotal,
      failedMessagesLast7Days,
      lastFailureAt: latestFailedMessage?.createdAt ?? null,
      lastFailureMessage: latestFailedMessage?.providerResponse ?? null
    };
  }
}

function parsePayload(payloadJson?: string | null) {
  if (!payloadJson) {
    return null;
  }

  try {
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}
