export type PaymentAllocationInput = {
  saleId: string;
  remainingAmount: number;
};

export type PaymentAllocationResult = {
  saleId: string;
  amount: number;
};

export function allocatePaymentOldestFirst(input: {
  paymentAmount: number;
  openSales: PaymentAllocationInput[];
}) {
  let remainingPayment = roundCurrency(input.paymentAmount);
  const allocations: PaymentAllocationResult[] = [];

  for (const sale of input.openSales) {
    if (remainingPayment <= 0) break;

    const allocationAmount = roundCurrency(Math.min(remainingPayment, sale.remainingAmount));

    if (allocationAmount <= 0) continue;

    allocations.push({
      saleId: sale.saleId,
      amount: allocationAmount
    });

    remainingPayment = roundCurrency(remainingPayment - allocationAmount);
  }

  return {
    allocations,
    unallocatedAmount: remainingPayment
  };
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
