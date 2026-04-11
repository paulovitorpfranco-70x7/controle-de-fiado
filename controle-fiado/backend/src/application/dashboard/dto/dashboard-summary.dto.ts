export type DashboardSummary = {
  totalOpenBalance: number;
  overdueCustomers: number;
  dueTodayCount: number;
  dueSoonCount: number;
  recentPaymentsTotal: number;
  recentSalesTotal: number;
  topDebtors: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    openBalance: number;
  }>;
};
