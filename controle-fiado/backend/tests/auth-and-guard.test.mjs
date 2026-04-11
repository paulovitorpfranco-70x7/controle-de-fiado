import test from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET = "test-secret";
process.env.DATABASE_URL = "file:./dev.db";
process.env.CORS_ORIGIN = "http://127.0.0.1:5173";
process.env.PORT = "3333";
process.env.WHATSAPP_PROVIDER = "mock";

const { SimplePasswordHasher } = await import("../dist/infra/auth/simple-password-hasher.js");
const { HmacTokenService } = await import("../dist/infra/auth/hmac-token.service.js");
const { buildApp } = await import("../dist/app.js");

test("password hasher validates plain dev passwords", async () => {
  const hasher = new SimplePasswordHasher();
  const matches = await hasher.compare("tonhao123", "plain:tonhao123");
  assert.equal(matches, true);
});

test("token service signs and verifies payload", async () => {
  const tokenService = new HmacTokenService();
  const token = await tokenService.sign({
    sub: "user-1",
    login: "tonhao",
    role: "OWNER"
  });

  const payload = await tokenService.verify(token);
  assert.equal(payload.sub, "user-1");
  assert.equal(payload.login, "tonhao");
  assert.equal(payload.role, "OWNER");
  assert.equal(typeof payload.iat, "number");
  assert.equal(typeof payload.exp, "number");
});

test("business routes require authentication", async () => {
  const app = buildApp();

  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/customers"
    });

    assert.equal(response.statusCode, 401);
  } finally {
    await app.close();
  }
});
