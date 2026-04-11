import test from "node:test";
import assert from "node:assert/strict";

const { MetaCloudWhatsAppProvider } = await import("../dist/infra/whatsapp/meta-cloud-whatsapp-provider.js");

test("meta cloud whatsapp provider sends text message and returns provider message id", async () => {
  const requests = [];

  const provider = new MetaCloudWhatsAppProvider(
    async (url, init) => {
      requests.push({ url, init });

      return {
        ok: true,
        status: 200,
        async json() {
          return {
            messages: [{ id: "wamid.123" }]
          };
        }
      };
    },
    {
      accessToken: "token-1",
      phoneNumberId: "phone-1",
      apiVersion: "v23.0"
    }
  );

  const result = await provider.sendMessage({
    customerId: "customer-1",
    phoneE164: "+55 11 99999-9999",
    message: "Ola",
    triggerType: "MANUAL"
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://graph.facebook.com/v23.0/phone-1/messages");
  assert.equal(requests[0].init.method, "POST");
  assert.equal(requests[0].init.headers.Authorization, "Bearer token-1");

  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.messaging_product, "whatsapp");
  assert.equal(body.to, "5511999999999");
  assert.equal(body.text.body, "Ola");
  assert.equal(result.providerName, "meta_cloud");
  assert.equal(result.providerMessageId, "wamid.123");
});
