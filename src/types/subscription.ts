import { z } from "zod";

export const BillingCycleSchema = z.enum([
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "one_time",
  "custom",
]);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const PaymentModeSchema = z.enum([
  "upi",
  "credit_card",
  "debit_card",
  "net_banking",
  "wallet",
  "cash",
  "other",
]);
export type PaymentMode = z.infer<typeof PaymentModeSchema>;

export const SubscriptionStatusSchema = z.enum([
  "active",
  "paused",
  "cancelled",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(40),
  color: z.string(),
  icon: z.string(),
  monthlyBudgetINR: z.number().nonnegative().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Category = z.infer<typeof CategorySchema>;

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  categoryId: z.string().uuid(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  billingCycle: BillingCycleSchema,
  customCycleDays: z.number().int().positive().nullable(),
  paymentMode: PaymentModeSchema,
  isRecurring: z.boolean(),
  nextDueDate: z.string(),
  startDate: z.string(),
  status: SubscriptionStatusSchema,
  notes: z.string().max(500).nullable(),
  reminderDaysBefore: z.number().int().min(0).max(30),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const AppSettingsSchema = z.object({
  id: z.literal("settings"),
  defaultCurrency: z.string().length(3),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  one_time: "One-time",
  custom: "Custom",
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  upi: "UPI",
  credit_card: "Credit card",
  debit_card: "Debit card",
  net_banking: "Net banking",
  wallet: "Wallet",
  cash: "Cash",
  other: "Other",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};