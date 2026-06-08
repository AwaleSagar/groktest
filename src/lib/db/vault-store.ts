import {
  createVaultRecord,
  encryptPayload,
  unlockVaultRecord,
  type VaultPayload,
  type VaultRecord,
} from "@/lib/crypto/vault";
import { db, DEFAULT_CATEGORIES } from "./schema";
import type { AppSettings, Category } from "@/types/subscription";

export { type VaultRecord } from "@/lib/crypto/vault";

export async function vaultExists(): Promise<boolean> {
  const record = await db.vault.get("vault");
  return Boolean(record);
}

export function buildDefaultPayload(): VaultPayload {
  const now = new Date().toISOString();
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }));

  const settings: AppSettings = {
    id: "settings",
    defaultCurrency: "INR",
    createdAt: now,
    updatedAt: now,
  };

  return { categories, subscriptions: [], settings };
}

export async function readPlaintextPayload(): Promise<VaultPayload | null> {
  const [categories, subscriptions, settings] = await Promise.all([
    db.categories.toArray(),
    db.subscriptions.toArray(),
    db.settings.get("settings"),
  ]);

  if (categories.length === 0 && subscriptions.length === 0 && !settings) {
    return null;
  }

  return {
    categories,
    subscriptions,
    settings: settings ?? buildDefaultPayload().settings,
  };
}

export async function writePayloadToTables(payload: VaultPayload): Promise<void> {
  await db.transaction(
    "rw",
    db.categories,
    db.subscriptions,
    db.settings,
    async () => {
      await db.categories.clear();
      await db.subscriptions.clear();
      await db.categories.bulkPut(payload.categories);
      await db.subscriptions.bulkPut(payload.subscriptions);
      await db.settings.put(payload.settings);
    },
  );
}

export async function clearWorkingTables(): Promise<void> {
  await db.transaction(
    "rw",
    db.categories,
    db.subscriptions,
    db.settings,
    async () => {
      await db.categories.clear();
      await db.subscriptions.clear();
      await db.settings.clear();
    },
  );
}

export async function setupVault(passphrase: string): Promise<CryptoKey> {
  const existing = await readPlaintextPayload();
  const payload = existing ?? buildDefaultPayload();
  const { record, key } = await createVaultRecord(passphrase, payload);
  await db.vault.put(record);
  await writePayloadToTables(payload);
  return key;
}

export async function unlockVault(passphrase: string): Promise<CryptoKey> {
  const record = await db.vault.get("vault");
  if (!record) throw new Error("No vault found");

  try {
    const { key, payload } = await unlockVaultRecord(record, passphrase);
    await writePayloadToTables(payload);
    return key;
  } catch {
    throw new Error("Incorrect passphrase");
  }
}

export async function persistVault(key: CryptoKey): Promise<void> {
  const record = await db.vault.get("vault");
  if (!record) return;

  const payload: VaultPayload = {
    categories: await db.categories.toArray(),
    subscriptions: await db.subscriptions.toArray(),
    settings: (await db.settings.get("settings")) ?? buildDefaultPayload().settings,
  };

  const { iv, ciphertext } = await encryptPayload(key, payload);
  await db.vault.put({
    ...record,
    iv,
    ciphertext,
    updatedAt: new Date().toISOString(),
  });
}

export async function lockVault(key: CryptoKey): Promise<void> {
  await persistVault(key);
  await clearWorkingTables();
}

export async function exportEncryptedVault(): Promise<VaultRecord | null> {
  const record = await db.vault.get("vault");
  return record ?? null;
}

export async function importEncryptedVault(record: VaultRecord): Promise<void> {
  await db.vault.put(record);
  await clearWorkingTables();
}