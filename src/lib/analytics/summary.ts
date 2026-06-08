import { subscriptionMonthlyCost } from "@/lib/billing/normalize";
import type { Category, Subscription } from "@/types/subscription";
import { addDays, isBefore, parseISO, startOfDay } from "date-fns";

export type CategorySpend = {
  category: Category;
  spend: number;
  budget: number | null;
  subscriptionCount: number;
};

export function totalMonthlySpend(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + subscriptionMonthlyCost(s), 0);
}

export function spendByCategory(
  subs: Subscription[],
  categories: Category[],
): CategorySpend[] {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return categories.map((category) => {
    const categorySubs = subs.filter(
      (s) => s.categoryId === category.id && s.status === "active",
    );
    const spend = categorySubs.reduce(
      (sum, s) => sum + subscriptionMonthlyCost(s),
      0,
    );
    return {
      category: catMap.get(category.id) ?? category,
      spend,
      budget: category.monthlyBudgetINR,
      subscriptionCount: categorySubs.length,
    };
  });
}

export function upcomingRenewals(
  subs: Subscription[],
  withinDays = 7,
): Subscription[] {
  const today = startOfDay(new Date());
  const cutoff = addDays(today, withinDays);

  return subs
    .filter((s) => {
      if (s.status !== "active") return false;
      const due = startOfDay(parseISO(s.nextDueDate));
      return !isBefore(due, today) && !isBefore(cutoff, due);
    })
    .sort(
      (a, b) =>
        parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime(),
    );
}