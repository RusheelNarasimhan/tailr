"use client";

import { useState } from "react";

type UpgradeModalProps = {
  onClose: () => void;
};

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold">You've used all 3 free tailors</h2>
        <p className="mt-2 text-sm text-[#f0ede6]/60">
          Upgrade once and tailor unlimited resumes forever. No subscription.
        </p>

        <div className="mt-5 rounded-xl border border-[#c9b87a]/30 bg-[#c9b87a]/5 p-4">
          <p className="text-2xl font-bold text-[#c9b87a]">$5</p>
          <p className="mt-0.5 text-xs text-[#f0ede6]/50">one-time · unlimited forever</p>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full rounded-xl bg-[#c9b87a] py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Upgrade — $5 one-time →"}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-[#f0ede6]/50 transition hover:text-[#f0ede6]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
