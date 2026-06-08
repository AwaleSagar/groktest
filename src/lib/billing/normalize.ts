import type { BillingCycle, Subscription } from "@/types/subscription";

export function monthlyEquivalent(
  amount: number,
  cycle: BillingCycle,
  customCycleDays?: number | null,
): number {
  switch (cycle) {
    case "monthly":
      return amount;
    case "yearly":
      return amount / 12;
    case "quarterly":
      return amount / 3;
    case "weekly":
      return (amount * 52) / 12;
    case "one_time":
      return 0;
    case "custom":
      if (!customCycleDays || customCycleDays <= 0) return amount;
      return amount * (30 / customCycleDays);
    default:
      return amount;
  }
}

export function subscriptionMonthlyCost(sub: Subscription): number {
  if (sub.status !== "active") return 0;
  if (!sub.isRecurring && sub.billingCycle !== "one_time") return 0;
  if (sub.billingCycle === "one_time") return 0;
  return monthlyEquivalent(sub.amount, sub.billingCycle, sub.customCycleDays);
}