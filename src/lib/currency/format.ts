const DEFAULT_LOCALE = "en-IN";

export function formatMoney(
  amount: number,
  currency = "INR",
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(amount);
}

export function formatCompact(amount: number, currency = "INR"): string {
  if (currency === "INR" && amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(lakhs >= 10 ? 0 : 1)}L`;
  }
  return formatMoney(amount, currency);
}