import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { PasswordHasher } from "../../application/ports/password-hasher.js";

export class SimplePasswordHasher implements PasswordHasher {
  async hash(value: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(value, salt, 64).toString("hex");
    return `scrypt:${salt}:${derivedKey}`;
  }

  async compare(value: string, hash: string) {
    if (hash.startsWith("plain:")) {
      return value === hash.slice("plain:".length);
    }

    if (!hash.startsWith("scrypt:")) {
      return value === hash;
    }

    const [, salt, storedKey] = hash.split(":");
    const derivedKey = scryptSync(value, salt, 64);
    const storedBuffer = Buffer.from(storedKey, "hex");

    return timingSafeEqual(derivedKey, storedBuffer);
  }
}
