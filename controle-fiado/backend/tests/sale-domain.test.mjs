import test from "node:test";
import assert from "node:assert/strict";

const { calculateSaleAmounts, resolveSaleStatus } = await import("../dist/domain/sales/sale.js");

test("calculateSaleAmounts computes fee from percentage", () => {
  const result = calculateSaleAmounts({
    originalAmount: 100,
    feePercent: 15
  });

  assert.deepEqual(result, {
    originalAmount: 100,
    feeAmount: 15,
    finalAmount: 115
  });
});

test("resolveSaleStatus marks overdue when due date has passed", () => {
  const result = resolveSaleStatus({
    remainingAmount: 10,
    dueDate: new Date("2020-01-01T00:00:00.000Z"),
    now: new Date("2020-01-02T00:00:00.000Z")
  });

  assert.equal(result, "OVERDUE");
});
