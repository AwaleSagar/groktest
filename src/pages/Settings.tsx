import { db } from "@/lib/db/schema";
import { useSettings } from "@/hooks/useSubscriptions";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";

export function Settings() {
  const settings = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  async function exportData() {
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

  async function importData(file: File) {
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
    window.location.reload();
  }

  return (
    <div className="page">
      <header className="page-header page-header--compact">
        <h1 className="page-header__title">Settings</h1>
      </header>

      <section className="section">
        <h2 className="section__title">Preferences</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span>Default currency</span>
            <strong>{settings?.defaultCurrency ?? "INR"}</strong>
          </div>
          <p className="settings-note">
            Per-subscription currency can be changed when adding a service.
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Backup</h2>
        <div className="settings-card">
          <button type="button" className="btn btn--secondary btn--block" onClick={exportData}>
            <Download size={18} /> Export JSON
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={18} /> Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importData(file);
              e.target.value = "";
            }}
          />
          <p className="settings-note">
            Encrypted vault export coming in a future update. Keep backup files private.
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Coming soon</h2>
        <ul className="future-list">
          <li>Passphrase app lock & encrypted storage</li>
          <li>Supabase cloud sync</li>
          <li>Gmail receipt parsing</li>
          <li>Google Sheets export</li>
        </ul>
      </section>

      <p className="app-version">SubVault v0.1.0</p>
    </div>
  );
}