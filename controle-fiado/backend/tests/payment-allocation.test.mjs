import test from "node:test";
import assert from "node:assert/strict";

const { allocatePaymentOldestFirst } = await import("../dist/domain/payments/payment-allocation.js");

test("allocatePaymentOldestFirst pays oldest debits first", () => {
  const result = allocatePaymentOldestFirst({
    paymentAmount: 120,
    openSales: [
      { saleId: "sale-1", remainingAmount: 100 },
      { saleId: "sale-2", remainingAmount: 60 }
    ]
  });

  assert.deepEqual(result, {
    allocations: [
      { saleId: "sale-1", amount: 100 },
      { saleId: "sale-2", amount: 20 }
    ],
    unallocatedAmount: 0
  });
});

test("allocatePaymentOldestFirst keeps unallocated remainder when there is no open balance", () => {
  const result = allocatePaymentOldestFirst({
    paymentAmount: 50,
    openSales: []
  });

  assert.deepEqual(result, {
    allocations: [],
    unallocatedAmount: 50
  });
});
