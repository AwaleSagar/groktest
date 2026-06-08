import Dexie, { type Table } from "dexie";
import type { VaultRecord } from "@/lib/crypto/vault";
import type { AppSettings, Category, Subscription } from "@/types/subscription";

export const DEFAULT_CATEGORIES: Omit<
  Category,
  "id" | "createdAt" | "updatedAt"
>[] = [
  { name: "Streaming", color: "#e07a5f", icon: "tv", monthlyBudgetINR: null },
  {
    name: "Productivity",
    color: "#81b29a",
    icon: "briefcase",
    monthlyBudgetINR: null,
  },
  { name: "Cloud & Dev", color: "#3d5a80", icon: "cloud", monthlyBudgetINR: null },
  {
    name: "Health",
    color: "#f2cc8f",
    icon: "heart",
    monthlyBudgetINR: null,
  },
  {
    name: "Finance",
    color: "#9b5de5",
    icon: "landmark",
    monthlyBudgetINR: null,
  },
  { name: "Other", color: "#8d99ae", icon: "layers", monthlyBudgetINR: null },
];

export class SubVaultDB extends Dexie {
  categories!: Table<Category, string>;
  subscriptions!: Table<Subscription, string>;
  settings!: Table<AppSettings, string>;
  vault!: Table<VaultRecord, string>;

  constructor() {
    super("subvault");
    this.version(1).stores({
      categories: "id, name",
      subscriptions: "id, categoryId, status, nextDueDate, name",
      settings: "id",
    });
    this.version(2).stores({
      categories: "id, name",
      subscriptions: "id, categoryId, status, nextDueDate, name",
      settings: "id",
      vault: "id",
    });
  }
}

export const db = new SubVaultDB();