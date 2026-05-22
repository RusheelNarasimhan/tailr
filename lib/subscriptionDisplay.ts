export type SubscriptionBillingView = {
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
};

export function formatProUntil(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getSubscriptionBillingView(
  profile: SubscriptionBillingView | null | undefined,
): {
  showProUntil: boolean;
  proUntilLabel: string | null;
} {
  if (!profile?.cancelAtPeriodEnd || !profile.periodEnd) {
    return { showProUntil: false, proUntilLabel: null };
  }
  return {
    showProUntil: true,
    proUntilLabel: formatProUntil(profile.periodEnd),
  };
}
