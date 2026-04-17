import type { AuthUser } from "../features/auth/types/auth";
import type { ChargeMessage } from "../features/charges/types/charge-message";
import type { ChargeOverview } from "../features/charges/types/charge-overview";
import type { DailyChargeJobMonitor } from "../features/charges/types/daily-charge-job-monitor";
import type { CustomerDetail } from "../features/customers/types/customer-detail";
import type { Customer } from "../features/customers/types/customer";
import type { DashboardSummary } from "../features/dashboard/types/dashboard-summary";
import type { Payment } from "../features/payments/types/payment";
import type { Sale } from "../features/sales/types/sale";
import type { SystemStatus } from "../features/system/types/system-status";

export type AppSection = "dashboard" | "customers" | "operations" | "charges" | "status";

export type NoticeState = {
  tone: "success" | "error";
  message: string;
};

export type AppDataState = {
  authUser: AuthUser | null;
  customers: Customer[];
  selectedCustomerId: string;
  customerDetail: CustomerDetail | null;
  dashboardSummary: DashboardSummary | null;
  sales: Sale[];
  payments: Payment[];
  chargeOverview: ChargeOverview | null;
  chargeMessages: ChargeMessage[];
  dailyChargeJobMonitor: DailyChargeJobMonitor | null;
  systemStatus: SystemStatus | null;
  loading: boolean;
  error: string | null;
  notice: NoticeState | null;
  activeSection: AppSection;
};
