import { formatMoney } from "@/lib/currency/format";

type BudgetBarProps = {
  label: string;
  color: string;
  spend: number;
  budget: number | null;
  currency?: string;
};

export function BudgetBar({
  label,
  color,
  spend,
  budget,
  currency = "INR",
}: BudgetBarProps) {
  const pct = budget && budget > 0 ? Math.min((spend / budget) * 100, 100) : 0;
  const over = budget != null && budget > 0 && spend > budget;

  return (
    <div className="budget-bar">
      <div className="budget-bar__header">
        <span className="budget-bar__label">
          <span className="budget-bar__dot" style={{ background: color }} />
          {label}
        </span>
        <span className={`budget-bar__amount${over ? " budget-bar__amount--over" : ""}`}>
          {formatMoney(spend, currency)}
          {budget != null && budget > 0 && (
            <span className="budget-bar__limit"> / {formatMoney(budget, currency)}</span>
          )}
        </span>
      </div>
      {budget != null && budget > 0 && (
        <div className="budget-bar__track">
          <div
            className={`budget-bar__fill${over ? " budget-bar__fill--over" : ""}`}
            style={{ width: `${pct}%`, background: over ? "var(--danger)" : color }}
          />
        </div>
      )}
    </div>
  );
}