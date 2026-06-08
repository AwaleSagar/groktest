import { BudgetBar } from "@/components/BudgetBar";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import {
  spendByCategory,
  totalMonthlySpend,
  upcomingRenewals,
} from "@/lib/analytics/summary";
import { formatMoney } from "@/lib/currency/format";
import { useCategories, useSettings, useSubscriptions } from "@/hooks/useSubscriptions";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const categories = useCategories() ?? [];
  const subscriptions = useSubscriptions() ?? [];
  const settings = useSettings();
  const currency = settings?.defaultCurrency ?? "INR";

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const monthlyTotal = totalMonthlySpend(activeSubs);
  const categorySpend = spendByCategory(activeSubs, categories);
  const dueSoon = upcomingRenewals(subscriptions, 7);
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="page">
      <header className="page-header">
        <p className="page-header__eyebrow">Monthly burn</p>
        <h1 className="page-header__title">{formatMoney(monthlyTotal, currency)}</h1>
        <p className="page-header__sub">
          {activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}
        </p>
      </header>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">By category</h2>
          <Link to="/budget" className="section__link">
            Manage budgets
          </Link>
        </div>
        <div className="stack">
          {categorySpend
            .filter((c) => c.spend > 0 || c.budget)
            .map(({ category, spend, budget }) => (
              <BudgetBar
                key={category.id}
                label={category.name}
                color={category.color}
                spend={spend}
                budget={budget}
                currency={currency}
              />
            ))}
          {categorySpend.every((c) => c.spend === 0 && !c.budget) && (
            <p className="empty-hint">Add subscriptions to see category breakdown.</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Due in 7 days</h2>
        </div>
        {dueSoon.length === 0 ? (
          <p className="empty-hint">Nothing due this week.</p>
        ) : (
          <div className="stack stack--tight">
            {dueSoon.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                category={catById.get(sub.categoryId)}
              />
            ))}
          </div>
        )}
      </section>

      <Link to="/subscriptions/new" className="fab" aria-label="Add subscription">
        <Plus size={24} />
      </Link>
    </div>
  );
}