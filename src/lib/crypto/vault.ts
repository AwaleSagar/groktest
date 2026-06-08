import type { AppSettings, Category, Subscription } from "@/types/subscription";

export const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export type VaultPayload = {
  categories: Category[];
  subscriptions: Subscription[];
  settings: AppSettings;
};

export type VaultRecord = {
  id: "vault";
  salt: string;
  iv: string;
  ciphertext: string;
  version: 1;
  updatedAt: string;
};

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function generateSalt(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

export async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPayload(
  key: CryptoKey,
  payload: VaultPayload,
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  return {
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptPayload(
  key: CryptoKey,
  iv: string,
  ciphertext: string,
): Promise<VaultPayload> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext),
  );

  const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as VaultPayload;
  if (!parsed.categories || !parsed.settings) {
    throw new Error("Invalid vault payload");
  }
  return parsed;
}

export async function createVaultRecord(
  passphrase: string,
  payload: VaultPayload,
  salt = generateSalt(),
): Promise<{ record: VaultRecord; key: CryptoKey }> {
  const key = await deriveKey(passphrase, salt);
  const { iv, ciphertext } = await encryptPayload(key, payload);

  return {
    key,
    record: {
      id: "vault",
      salt: toBase64(salt),
      iv,
      ciphertext,
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function unlockVaultRecord(
  record: VaultRecord,
  passphrase: string,
): Promise<{ key: CryptoKey; payload: VaultPayload }> {
  const key = await deriveKey(passphrase, fromBase64(record.salt));
  const payload = await decryptPayload(key, record.iv, record.ciphertext);
  return { key, payload };
}