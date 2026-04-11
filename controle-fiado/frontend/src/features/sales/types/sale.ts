export type Sale = {
  id: string;
  customerId: string;
  description: string;
  originalAmount: number;
  feeAmount: number;
  finalAmount: number;
  remainingAmount: number;
  saleDate: string;
  dueDate: string;
  status: "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELED";
  createdById: string;
  createdAt: string;
};
