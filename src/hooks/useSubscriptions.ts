import { useCallback } from "react";
import { db } from "@/lib/db/schema";
import type { Category, Subscription } from "@/types/subscription";
import { useLiveQuery } from "./useLiveQuery";

export function useCategories() {
  return useLiveQuery(() => db.categories.orderBy("name").toArray(), []);
}

export function useSubscriptions() {
  return useLiveQuery(
    () => db.subscriptions.orderBy("nextDueDate").toArray(),
    [],
  );
}

export function useSettings() {
  return useLiveQuery(() => db.settings.get("settings"), []);
}

export function useSubscriptionMutations() {
  const saveSubscription = useCallback(
    async (sub: Subscription) => {
      await db.subscriptions.put({
        ...sub,
        updatedAt: new Date().toISOString(),
      });
    },
    [],
  );

  const deleteSubscription = useCallback(async (id: string) => {
    await db.subscriptions.delete(id);
  }, []);

  const saveCategory = useCallback(async (cat: Category) => {
    await db.categories.put({
      ...cat,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const updateCategoryBudget = useCallback(
    async (id: string, monthlyBudgetINR: number | null) => {
      const cat = await db.categories.get(id);
      if (!cat) return;
      await db.categories.put({
        ...cat,
        monthlyBudgetINR,
        updatedAt: new Date().toISOString(),
      });
    },
    [],
  );

  return {
    saveSubscription,
    deleteSubscription,
    saveCategory,
    updateCategoryBudget,
  };
}