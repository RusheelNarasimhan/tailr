"use client";

import { getSubscriptionBillingView } from "@/lib/subscriptionDisplay";

type SubscriptionBannerProps = {
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  onManageSubscription?: () => void;
  billingLoading?: boolean;
};

export default function SubscriptionBanner({
  cancelAtPeriodEnd,
  periodEnd,
  onManageSubscription,
  billingLoading,
}: SubscriptionBannerProps) {
  const { showProUntil, proUntilLabel } = getSubscriptionBillingView({
    cancelAtPeriodEnd,
    periodEnd,
  });

  if (!showProUntil || !proUntilLabel) return null;

  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <p className="text-sm text-amber-100/90">
        <span className="font-medium text-amber-100">Subscription ending.</span>{" "}
        Pro access continues until <span className="font-medium">{proUntilLabel}</span>.
        You can resubscribe anytime before then.
      </p>
      {onManageSubscription ? (
        <button
          type="button"
          onClick={onManageSubscription}
          disabled={billingLoading}
          className="shrink-0 text-sm font-medium text-amber-100 underline transition hover:text-white disabled:opacity-50"
        >
          {billingLoading ? "Opening…" : "Manage subscription"}
        </button>
      ) : null}
    </div>
  );
}
