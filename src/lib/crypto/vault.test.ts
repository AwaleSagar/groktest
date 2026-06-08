import { describe, expect, it } from "vitest";
import {
  createVaultRecord,
  decryptPayload,
  encryptPayload,
  generateSalt,
  deriveKey,
} from "./vault";
import type { VaultPayload } from "./vault";

const samplePayload: VaultPayload = {
  categories: [],
  subscriptions: [],
  settings: {
    id: "settings",
    defaultCurrency: "INR",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe("vault crypto", () => {
  it("encrypts and decrypts payload", async () => {
    const salt = generateSalt();
    const key = await deriveKey("test-passphrase-123", salt);
    const { iv, ciphertext } = await encryptPayload(key, samplePayload);
    const decrypted = await decryptPayload(key, iv, ciphertext);
    expect(decrypted.settings.defaultCurrency).toBe("INR");
  });

  it("rejects wrong passphrase", async () => {
    const { record } = await createVaultRecord("correct-pass", samplePayload);
    const salt = Uint8Array.from(atob(record.salt), (c) => c.charCodeAt(0));
    const wrongKey = await deriveKey("wrong-pass", salt);
    await expect(
      decryptPayload(wrongKey, record.iv, record.ciphertext),
    ).rejects.toThrow();
  });
});