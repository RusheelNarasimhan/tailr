"use client";

import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/authErrors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function UpdatePasswordInner() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }
      setReady(true);
    }
    void checkSession();
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(formatAuthError(updateError, "signin"));
      return;
    }

    router.replace("/app");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#f0ede6]/50">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#f0ede6]">
      <div className="w-full max-w-md px-6 py-10">
        <Link href="/" className="text-lg font-semibold text-[#c9b87a]">
          tailr
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Set a new password</h1>
        <p className="mt-2 text-sm text-[#f0ede6]/50">
          Choose a password for your account, then you can sign in anytime.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (6+ characters)"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#c9b87a]/60"
          />
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#c9b87a]/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c9b87a] py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save password"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordInner />
    </Suspense>
  );
}
