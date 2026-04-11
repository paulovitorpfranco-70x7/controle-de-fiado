import test from "node:test";
import assert from "node:assert/strict";

const { mapCustomerDetail } = await import("../dist/infra/db/prisma/repositories/prisma-customer-detail-repository.js");
const { PrismaAuditLogService } = await import("../dist/infra/observability/prisma-audit-log.service.js");

test("customer detail derives open balance only from open statuses", () => {
  const result = mapCustomerDetail({
    id: "customer-1",
    name: "Maria",
    phone: "(11) 99999-9999",
    phoneE164: "+5511999999999",
    address: null,
    creditLimitCents: 100000,
    notes: null,
    isActive: true,
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    sales: [
      {
        id: "sale-1",
        customerId: "customer-1",
        description: "Compra 1",
        originalAmountCents: 10000,
        feeAmountCents: 0,
        finalAmountCents: 10000,
        remainingAmountCents: 3000,
        saleDate: new Date("2026-04-01T00:00:00.000Z"),
        dueDate: new Date("2026-04-10T00:00:00.000Z"),
        status: "PARTIAL",
        createdById: "user-1",
        createdAt: new Date("2026-04-01T00:00:00.000Z")
      },
      {
        id: "sale-2",
        customerId: "customer-1",
        description: "Compra 2",
        originalAmountCents: 5000,
        feeAmountCents: 0,
        finalAmountCents: 5000,
        remainingAmountCents: 0,
        saleDate: new Date("2026-04-02T00:00:00.000Z"),
        dueDate: new Date("2026-04-11T00:00:00.000Z"),
        status: "PAID",
        createdById: "user-1",
        createdAt: new Date("2026-04-02T00:00:00.000Z")
      },
      {
        id: "sale-3",
        customerId: "customer-1",
        description: "Compra 3",
        originalAmountCents: 8000,
        feeAmountCents: 0,
        finalAmountCents: 8000,
        remainingAmountCents: 8000,
        saleDate: new Date("2026-04-03T00:00:00.000Z"),
        dueDate: new Date("2026-04-12T00:00:00.000Z"),
        status: "OVERDUE",
        createdById: "user-1",
        createdAt: new Date("2026-04-03T00:00:00.000Z")
      }
    ],
    payments: []
  });

  assert.equal(result.openBalance, 110);
});

test("audit log service persists serialized payload", async () => {
  const calls = [];
  const service = new PrismaAuditLogService({
    auditLog: {
      create: async (input) => {
        calls.push(input);
        return undefined;
      }
    }
  });

  await service.register({
    actorUserId: "user-1",
    action: "customer_updated",
    entityType: "customer",
    entityId: "customer-1",
    payload: {
      field: "phone"
    }
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    data: {
      actorUserId: "user-1",
      action: "customer_updated",
      entityType: "customer",
      entityId: "customer-1",
      payloadJson: JSON.stringify({ field: "phone" })
    }
  });
});
