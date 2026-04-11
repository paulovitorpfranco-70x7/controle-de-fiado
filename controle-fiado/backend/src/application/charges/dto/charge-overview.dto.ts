export type ChargeOverview = {
  customerId: string;
  customerName: string;
  phone: string;
  phoneE164: string | null;
  saleId: string;
  dueDate: Date;
  remainingAmount: number;
  status: "OPEN" | "PARTIAL" | "OVERDUE";
};
