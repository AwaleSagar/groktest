import Dexie, { type Table } from "dexie";
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

  constructor() {
    super("subvault");
    this.version(1).stores({
      categories: "id, name",
      subscriptions: "id, categoryId, status, nextDueDate, name",
      settings: "id",
    });
  }
}

export const db = new SubVaultDB();

export async function ensureSeeded(): Promise<void> {
  const count = await db.categories.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  await db.transaction("rw", db.categories, db.settings, async () => {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.categories.add({
        ...cat,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      });
    }
    await db.settings.put({
      id: "settings",
      defaultCurrency: "INR",
      createdAt: now,
      updatedAt: now,
    });
  });
}