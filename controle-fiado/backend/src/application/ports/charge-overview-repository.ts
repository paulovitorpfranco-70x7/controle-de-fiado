import type { ChargeOverview } from "../charges/dto/charge-overview.dto.js";

export interface ChargeOverviewRepository {
  listDueSoon(referenceDate: Date): Promise<ChargeOverview[]>;
  listDueToday(referenceDate: Date): Promise<ChargeOverview[]>;
  listOverdue(referenceDate: Date): Promise<ChargeOverview[]>;
  findCustomerChargeContext(customerId: string, saleId?: string): Promise<ChargeOverview | null>;
}
