import { subscriptionMonthlyCost } from "@/lib/billing/normalize";
import { db } from "@/lib/db/schema";
import { formatMoney } from "@/lib/currency/format";
import {
  useCategories,
  useSettings,
  useSubscriptionMutations,
} from "@/hooks/useSubscriptions";
import {
  BILLING_CYCLE_LABELS,
  PAYMENT_MODE_LABELS,
  STATUS_LABELS,
  type BillingCycle,
  type PaymentMode,
  type Subscription,
  type SubscriptionStatus,
} from "@/types/subscription";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

function emptyForm(categoryId: string, currency: string): Subscription {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "",
    categoryId,
    amount: 0,
    currency,
    billingCycle: "monthly",
    customCycleDays: null,
    paymentMode: "upi",
    isRecurring: true,
    nextDueDate: todayISO(),
    startDate: todayISO(),
    status: "active",
    notes: null,
    reminderDaysBefore: 3,
    createdAt: now,
    updatedAt: now,
  };
}

export function SubscriptionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== "new");
  const navigate = useNavigate();
  const categories = useCategories() ?? [];
  const settings = useSettings();
  const { saveSubscription, deleteSubscription } = useSubscriptionMutations();

  const defaultCurrency = settings?.defaultCurrency ?? "INR";
  const [form, setForm] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      const firstCat = categories[0]?.id ?? "";
      setForm(emptyForm(firstCat, defaultCurrency));
      setLoading(false);
      return;
    }
    db.subscriptions.get(id!).then((sub) => {
      setForm(sub ?? null);
      setLoading(false);
    });
  }, [id, isEdit, categories, defaultCurrency]);

  const preview = useMemo(() => {
    if (!form) return 0;
    return subscriptionMonthlyCost(form);
  }, [form]);

  function update<K extends keyof Subscription>(key: K, value: Subscription[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || !form.name.trim() || !form.categoryId) return;
    await saveSubscription({ ...form, name: form.name.trim() });
    navigate("/subscriptions");
  }

  async function onDelete() {
    if (!isEdit || !id) return;
    if (!confirm("Delete this subscription?")) return;
    await deleteSubscription(id);
    navigate("/subscriptions");
  }

  if (loading) return <div className="page"><p className="empty-hint">Loading…</p></div>;
  if (!form) return <div className="page"><p className="empty-hint">Subscription not found.</p></div>;

  return (
    <div className="page page--form">
      <header className="page-header page-header--compact">
        <Link to="/subscriptions" className="back-link">
          ← Back
        </Link>
        <h1 className="page-header__title">
          {isEdit ? "Edit" : "Add"} subscription
        </h1>
      </header>

      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <span>Service name</span>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Netflix, Spotify"
          />
        </label>

        <label className="field">
          <span>Category</span>
          <select
            required
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>Amount</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount || ""}
              onChange={(e) => update("amount", Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Currency</span>
            <input
              required
              maxLength={3}
              value={form.currency}
              onChange={(e) => update("currency", e.target.value.toUpperCase())}
              placeholder="INR"
            />
          </label>
        </div>

        <label className="field">
          <span>Billing cycle</span>
          <select
            value={form.billingCycle}
            onChange={(e) => update("billingCycle", e.target.value as BillingCycle)}
          >
            {Object.entries(BILLING_CYCLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>

        {form.billingCycle === "custom" && (
          <label className="field">
            <span>Custom cycle (days)</span>
            <input
              type="number"
              min="1"
              value={form.customCycleDays ?? ""}
              onChange={(e) =>
                update("customCycleDays", e.target.value ? Number(e.target.value) : null)
              }
            />
          </label>
        )}

        <label className="field">
          <span>Payment mode</span>
          <select
            value={form.paymentMode}
            onChange={(e) => update("paymentMode", e.target.value as PaymentMode)}
          >
            {Object.entries(PAYMENT_MODE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={(e) => update("isRecurring", e.target.checked)}
          />
          <span>Auto-renewing (recurring payment)</span>
        </label>

        <div className="field-row">
          <label className="field">
            <span>Next due date</span>
            <input
              type="date"
              required
              value={form.nextDueDate}
              onChange={(e) => update("nextDueDate", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value as SubscriptionStatus)}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Notes (optional)</span>
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value || null)}
            placeholder="Plan details, card used, etc."
          />
        </label>

        {preview > 0 && (
          <p className="preview-pill">
            ≈ {formatMoney(preview, form.currency)}/month equivalent
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            {isEdit ? "Save changes" : "Add subscription"}
          </button>
          {isEdit && (
            <button type="button" className="btn btn--danger" onClick={onDelete}>
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}