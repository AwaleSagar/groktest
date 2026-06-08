import { BudgetBar } from "@/components/BudgetBar";
import { spendByCategory, totalMonthlySpend } from "@/lib/analytics/summary";
import { formatMoney } from "@/lib/currency/format";
import {
  useCategories,
  useSettings,
  useSubscriptionMutations,
  useSubscriptions,
} from "@/hooks/useSubscriptions";
import { useState } from "react";

export function Budget() {
  const categories = useCategories() ?? [];
  const subscriptions = useSubscriptions() ?? [];
  const settings = useSettings();
  const { updateCategoryBudget } = useSubscriptionMutations();
  const currency = settings?.defaultCurrency ?? "INR";

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const total = totalMonthlySpend(activeSubs);
  const categorySpend = spendByCategory(activeSubs, categories);
  const totalBudget = categories.reduce(
    (sum, c) => sum + (c.monthlyBudgetINR ?? 0),
    0,
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function saveBudget(categoryId: string) {
    const value = draft.trim() === "" ? null : Number(draft);
    if (value !== null && (Number.isNaN(value) || value < 0)) return;
    await updateCategoryBudget(categoryId, value);
    setEditingId(null);
    setDraft("");
  }

  return (
    <div className="page">
      <header className="page-header page-header--compact">
        <h1 className="page-header__title">Budget</h1>
        <p className="page-header__sub">
          Spending vs limits by category
        </p>
      </header>

      <div className="summary-card">
        <div className="summary-card__row">
          <span>Total monthly spend</span>
          <strong>{formatMoney(total, currency)}</strong>
        </div>
        {totalBudget > 0 && (
          <div className="summary-card__row">
            <span>Total budget set</span>
            <strong
              className={total > totalBudget ? "text-danger" : ""}
            >
              {formatMoney(totalBudget, currency)}
            </strong>
          </div>
        )}
      </div>

      <section className="section">
        <h2 className="section__title">Categories</h2>
        <div className="stack">
          {categorySpend.map(({ category, spend, budget }) => (
            <div key={category.id} className="budget-item">
              <BudgetBar
                label={category.name}
                color={category.color}
                spend={spend}
                budget={budget}
                currency={currency}
              />
              {editingId === category.id ? (
                <div className="budget-edit">
                  <input
                    type="number"
                    min="0"
                    placeholder="Monthly limit (INR)"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn btn--small btn--primary"
                    onClick={() => saveBudget(category.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() => {
                    setEditingId(category.id);
                    setDraft(budget?.toString() ?? "");
                  }}
                >
                  {budget ? "Edit limit" : "Set limit"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}