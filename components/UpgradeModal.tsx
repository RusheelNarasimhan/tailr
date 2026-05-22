"use client";

import { useState } from "react";

type UpgradeModalProps = {
  onClose: () => void;
  isPro?: boolean;
  onRefreshProfile?: () => void | Promise<void>;
};

export default function UpgradeModal({
  onClose,
  isPro = false,
  onRefreshProfile,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            Unlimited tailoring is active on your account.
          </p>
          <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
            Continue tailoring
          </button>
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
          You&apos;ve used your three free runs. Upgrade once—no subscription—and
          tailor as many resumes as you need.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-[#f0ede6]/65">
          <li className="flex gap-2">
            <span className="text-[#c9b87a]">✓</span> Unlimited AI generations
          </li>
          <li className="flex gap-2">
            <span className="text-[#c9b87a]">✓</span> All templates & exports
          </li>
          <li className="flex gap-2">
            <span className="text-[#c9b87a]">✓</span> Lifetime access — $5 once
          </li>
        </ul>

        <div className="mt-6 rounded-xl border border-[#c9b87a]/30 bg-[#c9b87a]/8 px-5 py-4">
          <p className="text-3xl font-bold text-[#c9b87a]">$5</p>
          <p className="text-xs text-[#f0ede6]/45">One-time payment via Stripe</p>
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
            {loading ? "Redirecting to checkout…" : "Upgrade now"}
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
