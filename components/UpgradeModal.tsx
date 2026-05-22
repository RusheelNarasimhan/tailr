"use client";

import { getProPriceLabel, getProPriceShort } from "@/lib/pricing";
import { getSubscriptionBillingView } from "@/lib/subscriptionDisplay";
import { useState } from "react";

type UpgradeModalProps = {
  onClose: () => void;
  isPro?: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionPeriodEnd?: string | null;
  onManageSubscription?: () => void;
  billingLoading?: boolean;
  onRefreshProfile?: () => void | Promise<void>;
};

export default function UpgradeModal({
  onClose,
  isPro = false,
  subscriptionCancelAtPeriodEnd = false,
  subscriptionPeriodEnd = null,
  onManageSubscription,
  billingLoading = false,
  onRefreshProfile,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showProUntil, proUntilLabel } = getSubscriptionBillingView({
    cancelAtPeriodEnd: subscriptionCancelAtPeriodEnd,
    periodEnd: subscriptionPeriodEnd,
  });

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as {
        url?: string;
        alreadyPro?: boolean;
        error?: string;
      };

      if (data.alreadyPro) {
        await onRefreshProfile?.();
        onClose();
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <div className="card-elevated w-full max-w-md p-8">
          <p className="section-label">Account</p>
          <h2 className="mt-2 text-xl font-semibold">You&apos;re on Pro</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#f0ede6]/55">
            {showProUntil && proUntilLabel ? (
              <>
                Your subscription is set to end on{" "}
                <span className="font-medium text-[#f0ede6]/80">{proUntilLabel}</span>.
                Pro access continues until then. Open manage subscription to
                update payment details or cancel.
              </>
            ) : (
              <>
                Your Pro subscription is active. Use manage subscription to
                update your card or cancel anytime (access continues through the
                end of the paid month).
              </>
            )}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {onManageSubscription ? (
              <button
                type="button"
                onClick={onManageSubscription}
                disabled={billingLoading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {billingLoading ? "Opening…" : "Manage subscription"}
              </button>
            ) : null}
            <button type="button" onClick={onClose} className="btn-secondary w-full !py-2.5">
              Continue tailoring
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="card-elevated w-full max-w-md p-8">
        <p className="section-label">Upgrade</p>
        <h2 className="mt-2 text-xl font-semibold">Unlock unlimited tailoring</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#f0ede6]/55">
          You&apos;ve used your three free runs. Subscribe to Pro for unlimited
          tailoring—cancel anytime from manage subscription.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-[#f0ede6]/65">
          <li className="flex gap-2">
            <span className="text-[#c9b87a]">✓</span> Unlimited AI generations
          </li>
          <li className="flex gap-2">
            <span className="text-[#c9b87a]">✓</span> All templates & exports
          </li>
          <li className="flex gap-2">
            <span className="text-[#c9b87a]">✓</span> Cancel anytime; keep Pro until period ends
          </li>
        </ul>

        <div className="mt-6 rounded-xl border border-[#c9b87a]/30 bg-[#c9b87a]/8 px-5 py-4">
          <p className="text-3xl font-bold text-[#c9b87a]">{getProPriceShort()}</p>
          <p className="text-xs text-[#f0ede6]/45">
            {getProPriceLabel()} · billed monthly in CAD
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Redirecting to checkout…" : `Subscribe — ${getProPriceLabel()}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full !py-2.5"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
