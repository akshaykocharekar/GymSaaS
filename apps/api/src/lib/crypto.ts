import { randomBytes, createHash, randomUUID } from "node:crypto";
import {
  ACTIVATION_CODE_ALPHABET,
  ACTIVATION_CODE_GROUPS,
  ACTIVATION_CODE_GROUP_LEN,
  ACTIVATION_CODE_PREFIX,
} from "@gymora/shared";

/**
 * Generates a code like GYM-XXXX-XXXX.
 * Uses crypto.randomBytes for CSPRNG entropy.
 */
export function generateActivationCode(): string {
  const totalLen = ACTIVATION_CODE_GROUPS * ACTIVATION_CODE_GROUP_LEN;
  const alphabet = ACTIVATION_CODE_ALPHABET;
  const bytes = randomBytes(totalLen * 2); // oversample to avoid modulo bias
  const chars: string[] = [];
  let i = 0;
  while (chars.length < totalLen && i < bytes.length) {
    const b = bytes[i++];
    if (b < 256 - (256 % alphabet.length)) {
      chars.push(alphabet[b % alphabet.length]);
    }
  }
  // If still short (unlikely), fall back to simple map
  while (chars.length < totalLen) {
    chars.push(alphabet[randomBytes(1)[0] % alphabet.length]);
  }
  const groups: string[] = [];
  for (let g = 0; g < ACTIVATION_CODE_GROUPS; g++) {
    groups.push(
      chars
        .slice(g * ACTIVATION_CODE_GROUP_LEN, (g + 1) * ACTIVATION_CODE_GROUP_LEN)
        .join("")
    );
  }
  return `${ACTIVATION_CODE_PREFIX}-${groups.join("-")}`;
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function newId(): string {
  return randomUUID();
}