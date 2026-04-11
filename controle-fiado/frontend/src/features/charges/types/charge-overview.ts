export type ChargeOverviewItem = {
  customerId: string;
  customerName: string;
  phone: string;
  phoneE164: string | null;
  saleId: string;
  dueDate: string;
  remainingAmount: number;
  status: "OPEN" | "PARTIAL" | "OVERDUE";
};

export type ChargeOverview = {
  dueSoon: ChargeOverviewItem[];
  dueToday: ChargeOverviewItem[];
  overdue: ChargeOverviewItem[];
};
