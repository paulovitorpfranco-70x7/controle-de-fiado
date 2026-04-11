import test from "node:test";
import assert from "node:assert/strict";

const { RetryFailedChargeUseCase } = await import("../dist/application/charges/use-cases/retry-failed-charge.js");

test("retry failed charge resends failed message and preserves trigger type", async () => {
  const sentMessages = [];
  const createdMessages = [];
  const audited = [];

  const useCase = new RetryFailedChargeUseCase(
    {
      async findById(messageId) {
        return {
          id: messageId,
          customerId: "customer-1",
          saleId: "sale-1",
          triggerType: "AUTO_DUE_DATE",
          messageBody: "Mensagem de cobranca",
          sendStatus: "FAILED",
          providerName: "mock",
          providerMessageId: null,
          providerResponse: "timeout",
          scheduledFor: null,
          sentAt: null,
          createdById: "owner-1",
          createdAt: new Date()
        };
      },
      async create(input) {
        createdMessages.push(input);
        return {
          id: "message-new",
          ...input,
          saleId: input.saleId ?? null,
          providerName: input.providerName ?? null,
          providerMessageId: input.providerMessageId ?? null,
          providerResponse: input.providerResponse ?? null,
          scheduledFor: input.scheduledFor ?? null,
          sentAt: input.sentAt ?? null,
          createdById: input.createdById ?? null,
          createdAt: new Date()
        };
      }
    },
    {
      async findCustomerChargeContext() {
        return {
          customerId: "customer-1",
          customerName: "Maria",
          phoneE164: "+5511999999999",
          saleId: "sale-1",
          dueDate: new Date(),
          remainingAmount: 10
        };
      }
    },
    {
      async sendMessage(input) {
        sentMessages.push(input);
        return {
          providerName: "mock",
          providerMessageId: "provider-1",
          providerResponse: "ok"
        };
      }
    },
    {
      async register(entry) {
        audited.push(entry);
      }
    }
  );

  const result = await useCase.execute({
    messageId: "failed-message-1",
    createdById: "owner-1"
  });

  assert.equal(sentMessages.length, 1);
  assert.equal(sentMessages[0].triggerType, "AUTO_DUE_DATE");
  assert.equal(createdMessages.length, 1);
  assert.equal(createdMessages[0].sendStatus, "SENT");
  assert.equal(createdMessages[0].triggerType, "AUTO_DUE_DATE");
  assert.equal(audited[0].action, "failed_charge_resent");
  assert.equal(result.id, "message-new");
});
