"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push("/app");
    }
    void checkUser();
  }, [supabase, router]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const trimmed = email.trim();
      if (!trimmed) {
        setError("Please enter your email.");
        return;
      }

      const intent = new URLSearchParams(window.location.search).get("intent");
      const redirectTo =
        intent === "upgrade"
          ? `${origin}/auth/callback?next=${encodeURIComponent("/app?checkout=true")}`
          : `${origin}/auth/callback`;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (otpError) throw otpError;
      setStatus("Magic link sent. Check your email to finish signing in.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede6]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8">
          <div className="text-lg font-semibold tracking-tight">tailr</div>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">Log in</h1>
          <p className="mt-2 text-sm text-[#f0ede6]/70">
            Get a magic link via email.
          </p>
        </div>
        <form onSubmit={sendMagicLink} className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/40 outline-none focus:border-[#c9b87a]/60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        {status ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {status}
          </div>
        ) : null}
      </div>
    </div>
  );
}