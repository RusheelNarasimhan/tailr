/** Display price for marketing UI — keep in sync with your Stripe monthly price. */
export function getProPriceAmount(): string {
  const raw = process.env.NEXT_PUBLIC_PRO_PRICE_MONTHLY?.trim();
  return raw && /^\d+(\.\d{1,2})?$/.test(raw) ? raw : "4";
}

export function getProPriceCurrency(): string {
  const c = process.env.NEXT_PUBLIC_PRO_PRICE_CURRENCY?.trim().toUpperCase();
  return c === "USD" || c === "CAD" ? c : "CAD";
}

/** e.g. CA$4 */
export function getProPriceShort(): string {
  const amount = getProPriceAmount();
  const currency = getProPriceCurrency();
  if (currency === "CAD") return `CA$${amount}`;
  return `$${amount}`;
}

/** e.g. CA$4/mo */
export function getProPriceLabel(): string {
  return `${getProPriceShort()}/mo`;
}
