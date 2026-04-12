import test from "node:test";
import assert from "node:assert/strict";

const { parseDateInput } = await import("../dist/shared/date/date-input.js");
const { createSaleSchema } = await import("../dist/interfaces/http/modules/sales/sale.schemas.js");

test("parseDateInput preserves local calendar date for date-only values", () => {
  const result = parseDateInput("2026-04-12");

  assert.equal(result.getFullYear(), 2026);
  assert.equal(result.getMonth(), 3);
  assert.equal(result.getDate(), 12);
  assert.equal(result.getHours(), 12);
});

test("parseDateInput resolves due date to end of local day", () => {
  const result = parseDateInput("2026-04-12", "end");

  assert.equal(result.getFullYear(), 2026);
  assert.equal(result.getMonth(), 3);
  assert.equal(result.getDate(), 12);
  assert.equal(result.getHours(), 23);
  assert.equal(result.getMinutes(), 59);
});

test("createSaleSchema rejects due date before sale date", () => {
  assert.throws(() => {
    createSaleSchema.parse({
      customerId: "customer-1",
      description: "Compra fiado",
      originalAmount: 100,
      saleDate: "2026-04-12",
      dueDate: "2026-04-11",
      createdById: "user-1"
    });
  });
});
