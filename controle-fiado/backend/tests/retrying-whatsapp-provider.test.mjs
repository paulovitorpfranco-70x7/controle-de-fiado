import test from "node:test";
import assert from "node:assert/strict";

const { RetryingWhatsAppProvider } = await import("../dist/infra/whatsapp/retrying-whatsapp-provider.js");

test("retrying whatsapp provider retries before succeeding", async () => {
  let attempts = 0;

  const provider = new RetryingWhatsAppProvider(
    {
      async sendMessage() {
        attempts += 1;

        if (attempts < 3) {
          throw new Error("temporary failure");
        }

        return {
          providerName: "mock",
          providerMessageId: "msg-1",
          providerResponse: "ok"
        };
      }
    },
    undefined,
    2,
    0
  );

  const result = await provider.sendMessage({
    customerId: "customer-1",
    phoneE164: "+5511999999999",
    message: "teste",
    triggerType: "MANUAL"
  });

  assert.equal(attempts, 3);
  assert.equal(result?.providerMessageId, "msg-1");
});
