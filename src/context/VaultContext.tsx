import {
  lockVault,
  persistVault,
  setupVault,
  unlockVault,
  vaultExists,
} from "@/lib/db/vault-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type VaultStatus = "loading" | "needs_setup" | "locked" | "unlocked";

type VaultContextValue = {
  status: VaultStatus;
  error: string | null;
  setup: (passphrase: string, confirm: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => Promise<void>;
  schedulePersist: () => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    vaultExists().then((exists) => {
      setStatus(exists ? "locked" : "needs_setup");
    });
  }, []);

  const schedulePersist = useCallback(() => {
    if (!keyRef.current) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      if (keyRef.current) persistVault(keyRef.current).catch(console.error);
    }, 400);
  }, []);

  const setup = useCallback(async (passphrase: string, confirm: string) => {
    setError(null);
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters.");
      return;
    }
    if (passphrase !== confirm) {
      setError("Passphrases do not match.");
      return;
    }
    const key = await setupVault(passphrase);
    keyRef.current = key;
    setStatus("unlocked");
  }, []);

  const unlock = useCallback(async (passphrase: string) => {
    setError(null);
    try {
      const key = await unlockVault(passphrase);
      keyRef.current = key;
      setStatus("unlocked");
    } catch {
      setError("Incorrect passphrase. Try again.");
    }
  }, []);

  const lock = useCallback(async () => {
    if (!keyRef.current) return;
    await lockVault(keyRef.current);
    keyRef.current = null;
    setStatus("locked");
  }, []);

  const value = useMemo(
    () => ({ status, error, setup, unlock, lock, schedulePersist }),
    [status, error, setup, unlock, lock, schedulePersist],
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}