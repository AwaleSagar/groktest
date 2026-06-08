import { useVault } from "@/context/VaultContext";
import { db } from "@/lib/db/schema";
import {
  exportEncryptedVault,
  importEncryptedVault,
} from "@/lib/db/vault-store";
import { useSettings } from "@/hooks/useSubscriptions";
import { Download, Lock, Upload } from "lucide-react";
import { useRef } from "react";

export function Settings() {
  const settings = useSettings();
  const { lock, schedulePersist } = useVault();
  const fileRef = useRef<HTMLInputElement>(null);
  const vaultRef = useRef<HTMLInputElement>(null);

  async function exportPlainBackup() {
    const [categories, subscriptions, settingsRow] = await Promise.all([
      db.categories.toArray(),
      db.subscriptions.toArray(),
      db.settings.get("settings"),
    ]);
    const blob = new Blob(
      [JSON.stringify({ categories, subscriptions, settings: settingsRow }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportEncrypted() {
    const vault = await exportEncryptedVault();
    if (!vault) return;
    const blob = new Blob([JSON.stringify(vault, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subvault-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importPlain(file: File) {
    const text = await file.text();
    const data = JSON.parse(text) as {
      categories?: unknown[];
      subscriptions?: unknown[];
      settings?: unknown;
    };
    if (!confirm("Import will replace all current data. Continue?")) return;

    await db.transaction("rw", db.categories, db.subscriptions, db.settings, async () => {
      await db.categories.clear();
      await db.subscriptions.clear();
      if (data.categories) await db.categories.bulkAdd(data.categories as never[]);
      if (data.subscriptions) await db.subscriptions.bulkAdd(data.subscriptions as never[]);
      if (data.settings) await db.settings.put(data.settings as never);
    });
    schedulePersist();
    window.location.reload();
  }

  async function importEncrypted(file: File) {
    const text = await file.text();
    const record = JSON.parse(text);
    if (!confirm("Import encrypted vault? You will need your passphrase to unlock.")) {
      return;
    }
    await importEncryptedVault(record);
    await lock();
  }

  return (
    <div className="page">
      <header className="page-header page-header--compact">
        <h1 className="page-header__title">Settings</h1>
      </header>

      <section className="section">
        <h2 className="section__title">Security</h2>
        <div className="settings-card">
          <button type="button" className="btn btn--secondary btn--block" onClick={() => lock()}>
            <Lock size={18} /> Lock vault
          </button>
          <p className="settings-note">
            Data is encrypted with AES-256-GCM. Your passphrase never leaves this device.
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Preferences</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span>Default currency</span>
            <strong>{settings?.defaultCurrency ?? "INR"}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Backup</h2>
        <div className="settings-card">
          <button type="button" className="btn btn--secondary btn--block" onClick={exportEncrypted}>
            <Download size={18} /> Export encrypted vault
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => vaultRef.current?.click()}
          >
            <Upload size={18} /> Import encrypted vault
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={exportPlainBackup}>
            Export plaintext JSON (dev backup)
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => fileRef.current?.click()}
          >
            Import plaintext JSON
          </button>
          <input
            ref={vaultRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importEncrypted(file);
              e.target.value = "";
            }}
          />
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importPlain(file);
              e.target.value = "";
            }}
          />
          <p className="settings-note">
            Prefer encrypted vault export. Keep backup files offline and private.
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Coming soon</h2>
        <ul className="future-list">
          <li>Supabase cloud sync</li>
          <li>Gmail receipt parsing</li>
          <li>Google Sheets export</li>
        </ul>
      </section>

      <p className="app-version">SubVault v0.2.0</p>
    </div>
  );
}