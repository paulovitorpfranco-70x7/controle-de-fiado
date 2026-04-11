import { env } from "../../config/env.js";
import type { RunDailyChargeJobUseCase } from "../../application/charges/use-cases/run-daily-charge-job.js";

type SchedulerLogger = {
  info: (payload: Record<string, unknown>, message?: string) => void;
  error: (payload: Record<string, unknown>, message?: string) => void;
};

export class DailyChargeScheduler {
  private timeoutHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly runDailyChargeJobUseCase: RunDailyChargeJobUseCase,
    private readonly logger: SchedulerLogger,
    private readonly scheduleTime = env.dailyChargeScheduleTime
  ) {}

  start() {
    if (!env.enableDailyChargeScheduler) {
      this.logger.info(
        {
          event: "daily_charge_scheduler_disabled",
          scheduleTime: this.scheduleTime
        },
        "Daily charge scheduler disabled."
      );
      return;
    }

    this.scheduleNextRun();
  }

  stop() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  getStatus() {
    return {
      enabled: env.enableDailyChargeScheduler,
      scheduleTime: this.scheduleTime,
      nextRunAt: env.enableDailyChargeScheduler ? computeNextRunAt(new Date(), this.scheduleTime).toISOString() : null
    };
  }

  private scheduleNextRun(referenceDate = new Date()) {
    const nextRunAt = computeNextRunAt(referenceDate, this.scheduleTime);
    const delayMs = Math.max(nextRunAt.getTime() - Date.now(), 1000);

    this.logger.info(
      {
        event: "daily_charge_scheduler_scheduled",
        nextRunAt: nextRunAt.toISOString(),
        delayMs
      },
      "Daily charge scheduler planned next run."
    );

    this.timeoutHandle = setTimeout(async () => {
      await this.executeScheduledRun();
      this.scheduleNextRun(new Date());
    }, delayMs);
  }

  private async executeScheduledRun() {
    try {
      const result = await this.runDailyChargeJobUseCase.execute();

      this.logger.info(
        {
          event: "daily_charge_scheduler_executed",
          processedAt: result.processedAt.toISOString(),
          auto3DaysSent: result.auto3DaysSent,
          autoDueDateSent: result.autoDueDateSent,
          skippedDuplicates: result.skippedDuplicates,
          failedMessages: result.failedMessages
        },
        "Daily charge scheduler executed."
      );
    } catch (error) {
      this.logger.error(
        {
          event: "daily_charge_scheduler_failed",
          error
        },
        "Daily charge scheduler failed."
      );
    }
  }
}

export function computeNextRunAt(referenceDate: Date, scheduleTime: string) {
  const { hour, minute } = parseScheduleTime(scheduleTime);
  const nextRunAt = new Date(referenceDate);
  nextRunAt.setHours(hour, minute, 0, 0);

  if (nextRunAt.getTime() <= referenceDate.getTime()) {
    nextRunAt.setDate(nextRunAt.getDate() + 1);
  }

  return nextRunAt;
}

export function parseScheduleTime(scheduleTime: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(scheduleTime);

  if (!match) {
    throw new Error("Horario invalido para DAILY_CHARGE_SCHEDULE_TIME. Use HH:MM.");
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Horario invalido para DAILY_CHARGE_SCHEDULE_TIME. Use HH:MM.");
  }

  return { hour, minute };
}
