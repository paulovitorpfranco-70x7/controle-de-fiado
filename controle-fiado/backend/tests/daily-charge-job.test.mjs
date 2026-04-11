import test from "node:test";
import assert from "node:assert/strict";

const { RunDailyChargeJobUseCase } = await import("../dist/application/charges/use-cases/run-daily-charge-job.js");

test("daily charge job skips duplicated automatic messages", async () => {
  const dueSoon = [
    {
      customerId: "customer-1",
      customerName: "Maria",
      phoneE164: "+5511999999999",
      saleId: "sale-1",
      dueDate: new Date("2026-04-14T00:00:00.000Z"),
      remainingAmount: 50
    }
  ];

  const dueToday = [
    {
      customerId: "customer-2",
      customerName: "Joao",
      phoneE164: "+5511888888888",
      saleId: "sale-2",
      dueDate: new Date("2026-04-11T00:00:00.000Z"),
      remainingAmount: 80
    }
  ];

  const createdMessages = [];

  const useCase = new RunDailyChargeJobUseCase(
    {
      listDueSoon: async () => dueSoon,
      listDueToday: async () => dueToday,
      listOverdue: async () => [],
      findCustomerChargeContext: async () => null
    },
    {
      list: async () => [],
      listByCustomer: async () => [],
      findSuccessfulBySaleAndTrigger: async ({ saleId, triggerType }) =>
        saleId === "sale-1" && triggerType === "AUTO_3_DAYS" ? { id: "existing" } : null,
      create: async (input) => {
        createdMessages.push(input);
        return { id: `message-${createdMessages.length}`, ...input };
      }
    },
    {
      sendMessage: async () => undefined
    },
    {
      register: async () => undefined
    }
  );

  const result = await useCase.execute(new Date("2026-04-11T12:00:00.000Z"));

  assert.equal(result.auto3DaysSent, 0);
  assert.equal(result.autoDueDateSent, 1);
  assert.equal(result.skippedDuplicates, 1);
  assert.equal(createdMessages.length, 1);
  assert.equal(createdMessages[0].triggerType, "AUTO_DUE_DATE");
});

test("daily charge job audits execution summary", async () => {
  const auditCalls = [];

  const useCase = new RunDailyChargeJobUseCase(
    {
      listDueSoon: async () => [],
      listDueToday: async () => [],
      listOverdue: async () => [],
      findCustomerChargeContext: async () => null
    },
    {
      list: async () => [],
      listByCustomer: async () => [],
      findSuccessfulBySaleAndTrigger: async () => null,
      create: async (input) => ({ id: "message-1", ...input })
    },
    {
      sendMessage: async () => undefined
    },
    {
      register: async (entry) => {
        auditCalls.push(entry);
      }
    }
  );

  const result = await useCase.execute(new Date("2026-04-11T12:00:00.000Z"));

  assert.equal(result.auto3DaysSent, 0);
  assert.equal(result.autoDueDateSent, 0);
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0].action, "daily_charge_job_ran");
});
