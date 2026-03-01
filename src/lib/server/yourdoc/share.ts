import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const defaultPinSecret = "yourdoc-dev-pin-secret";

export function createShareToken() {
  return randomBytes(18).toString("base64url");
}

export function hashSharePin(pin: string) {
  const normalized = pin.trim();
  const secret = env.BRIEF_SHARE_PIN_SECRET ?? defaultPinSecret;
  return createHash("sha256").update(`${secret}:${normalized}`).digest("hex");
}

export function verifySharePin(pin: string, hash: string | null) {
  if (!hash) {
    return true;
  }

  if (!pin?.trim()) {
    return false;
  }

  return hashSharePin(pin) === hash;
}
