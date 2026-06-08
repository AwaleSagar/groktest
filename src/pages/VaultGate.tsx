import { useVault } from "@/context/VaultContext";
import { ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export function VaultGate() {
  const { status, error, setup, unlock } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (status === "needs_setup") {
        await setup(passphrase, confirm);
      } else {
        await unlock(passphrase);
      }
    } finally {
      setBusy(false);
    }
  }

  const isSetup = status === "needs_setup";

  return (
    <div className="vault-gate">
      <div className="vault-gate__card">
        <div className="vault-gate__icon">
          <ShieldCheck size={32} />
        </div>
        <h1 className="vault-gate__title">
          {isSetup ? "Secure your vault" : "Unlock SubVault"}
        </h1>
        <p className="vault-gate__sub">
          {isSetup
            ? "Create a passphrase to encrypt your subscriptions on this device. We cannot recover it if lost."
            : "Enter your passphrase to access your encrypted data."}
        </p>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Passphrase</span>
            <input
              type="password"
              required
              minLength={isSetup ? 8 : 1}
              autoComplete={isSetup ? "new-password" : "current-password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder={isSetup ? "At least 8 characters" : "Your passphrase"}
            />
          </label>

          {isSetup && (
            <label className="field">
              <span>Confirm passphrase</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          )}

          {error && <p className="vault-gate__error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? "Working…" : isSetup ? "Create vault" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}