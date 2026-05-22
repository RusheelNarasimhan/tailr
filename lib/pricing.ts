/** Display price for marketing UI — set NEXT_PUBLIC_PRO_PRICE_MONTHLY to match Stripe. */
export function getProPriceMonthlyUsd(): string {
  const raw = process.env.NEXT_PUBLIC_PRO_PRICE_MONTHLY?.trim();
  return raw && /^\d+(\.\d{1,2})?$/.test(raw) ? raw : "9";
}

export function getProPriceLabel(): string {
  return `$${getProPriceMonthlyUsd()}/mo`;
}

export function getProPriceShort(): string {
  return `$${getProPriceMonthlyUsd()}`;
}
