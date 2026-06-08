import { formatMoney } from "@/lib/currency/format";
import { subscriptionMonthlyCost } from "@/lib/billing/normalize";
import {
  BILLING_CYCLE_LABELS,
  PAYMENT_MODE_LABELS,
  STATUS_LABELS,
  type Category,
  type Subscription,
} from "@/types/subscription";
import { format, parseISO } from "date-fns";
import { ChevronRight, RefreshCw, HandCoins } from "lucide-react";
import { Link } from "react-router-dom";

type SubscriptionCardProps = {
  subscription: Subscription;
  category?: Category;
};

export function SubscriptionCard({ subscription, category }: SubscriptionCardProps) {
  const monthly = subscriptionMonthlyCost(subscription);

  return (
    <Link to={`/subscriptions/${subscription.id}/edit`} className="sub-card">
      <div className="sub-card__main">
        <div className="sub-card__top">
          <span
            className="sub-card__category"
            style={{ color: category?.color ?? "var(--muted)" }}
          >
            {category?.name ?? "Uncategorized"}
          </span>
          <span className={`sub-card__status sub-card__status--${subscription.status}`}>
            {STATUS_LABELS[subscription.status]}
          </span>
        </div>
        <h3 className="sub-card__name">{subscription.name}</h3>
        <div className="sub-card__meta">
          <span>{formatMoney(subscription.amount, subscription.currency)}</span>
          <span className="sub-card__sep">·</span>
          <span>{BILLING_CYCLE_LABELS[subscription.billingCycle]}</span>
          <span className="sub-card__sep">·</span>
          <span>{PAYMENT_MODE_LABELS[subscription.paymentMode]}</span>
        </div>
        <div className="sub-card__footer">
          <span className="sub-card__badge">
            {subscription.isRecurring ? (
              <>
                <RefreshCw size={12} /> Recurring
              </>
            ) : (
              <>
                <HandCoins size={12} /> Manual
              </>
            )}
          </span>
          <span className="sub-card__due">
            Due {format(parseISO(subscription.nextDueDate), "d MMM")}
          </span>
        </div>
      </div>
      <div className="sub-card__aside">
        {monthly > 0 && (
          <span className="sub-card__monthly">
            {formatMoney(monthly, subscription.currency)}
            <small>/mo</small>
          </span>
        )}
        <ChevronRight size={18} className="sub-card__chevron" />
      </div>
    </Link>
  );
}