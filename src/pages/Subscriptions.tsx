import { SubscriptionCard } from "@/components/SubscriptionCard";
import { useCategories, useSubscriptions } from "@/hooks/useSubscriptions";
import type { SubscriptionStatus } from "@/types/subscription";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const FILTERS: Array<SubscriptionStatus | "all"> = [
  "all",
  "active",
  "paused",
  "cancelled",
];

export function Subscriptions() {
  const categories = useCategories() ?? [];
  const subscriptions = useSubscriptions() ?? [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const [categoryId, setCategoryId] = useState<string>("all");

  const catById = new Map(categories.map((c) => [c.id, c]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscriptions.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (categoryId !== "all" && s.categoryId !== categoryId) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subscriptions, query, status, categoryId]);

  return (
    <div className="page">
      <header className="page-header page-header--compact">
        <h1 className="page-header__title">Subscriptions</h1>
      </header>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search services…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search subscriptions"
        />
      </div>

      <div className="chip-row" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={status === f}
            className={`chip${status === f ? " chip--active" : ""}`}
            onClick={() => setStatus(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="select-row">
        <label htmlFor="cat-filter">Category</label>
        <select
          id="cat-filter"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="stack stack--tight">
        {filtered.length === 0 ? (
          <p className="empty-hint">No subscriptions match your filters.</p>
        ) : (
          filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              category={catById.get(sub.categoryId)}
            />
          ))
        )}
      </div>

      <Link to="/subscriptions/new" className="fab" aria-label="Add subscription">
        <Plus size={24} />
      </Link>
    </div>
  );
}