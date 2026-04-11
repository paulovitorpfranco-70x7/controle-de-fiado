import type { ChargeOverviewRepository } from "../../ports/charge-overview-repository.js";

export class ListChargeOverviewUseCase {
  constructor(private readonly chargeOverviewRepository: ChargeOverviewRepository) {}

  async execute(referenceDate = new Date()) {
    const [dueSoon, dueToday, overdue] = await Promise.all([
      this.chargeOverviewRepository.listDueSoon(referenceDate),
      this.chargeOverviewRepository.listDueToday(referenceDate),
      this.chargeOverviewRepository.listOverdue(referenceDate)
    ]);

    return {
      dueSoon,
      dueToday,
      overdue
    };
  }
}
