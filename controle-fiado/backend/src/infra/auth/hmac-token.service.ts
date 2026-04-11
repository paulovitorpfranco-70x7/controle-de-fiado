import { createHmac } from "node:crypto";
import { unauthorized } from "../../application/errors/app-error.js";
import { env } from "../../config/env.js";
import type { TokenPayload, TokenService } from "../../application/ports/token-service.js";

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

export class HmacTokenService implements TokenService {
  async sign(payload: TokenPayload) {
    const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = toBase64Url(JSON.stringify(payload));
    const signature = this.signValue(`${header}.${body}`);
    return `${header}.${body}.${signature}`;
  }

  async verify(token: string) {
    const [header, body, signature] = token.split(".");

    if (!header || !body || !signature) {
      throw unauthorized("Token invalido.");
    }

    const expectedSignature = this.signValue(`${header}.${body}`);

    if (signature !== expectedSignature) {
      throw unauthorized("Token invalido.");
    }

    return fromBase64Url<TokenPayload>(body);
  }

  private signValue(value: string) {
    return createHmac("sha256", env.authSecret).update(value).digest("base64url");
  }
}
