export type SaleStatus = "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELED";

export type SaleItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Sale = {
  id: string;
  customerId: string;
  description: string;
  saleItems: SaleItem[];
  originalAmount: number;
  feeAmount: number;
  finalAmount: number;
  remainingAmount: number;
  saleDate: Date;
  dueDate: Date;
  status: SaleStatus;
  createdById: string;
  createdAt: Date;
};

export type SalePreview = {
  originalAmount: number;
  feeAmount: number;
  finalAmount: number;
};

export function calculateSaleAmounts(input: { originalAmount: number; feeAmount?: number; feePercent?: number }): SalePreview {
  const feeAmount = input.feeAmount ?? calculateFeeAmountFromPercent(input.originalAmount, input.feePercent);
  const finalAmount = roundCurrency(input.originalAmount + feeAmount);

  return {
    originalAmount: roundCurrency(input.originalAmount),
    feeAmount,
    finalAmount
  };
}

export function resolveSaleStatus(input: { remainingAmount: number; dueDate: Date; now?: Date }): SaleStatus {
  const now = input.now ?? new Date();

  if (input.remainingAmount <= 0) return "PAID";
  if (input.dueDate.getTime() < now.getTime()) return "OVERDUE";

  return "OPEN";
}

function calculateFeeAmountFromPercent(originalAmount: number, feePercent = 0) {
  return roundCurrency(originalAmount * (feePercent / 100));
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
