"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// Improved fade-in (IntersectionObserver)
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, 50);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const logo = useFadeIn(0);
  const heading = useFadeIn(100);
  const form = useFadeIn(200);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Redirect if already logged in
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.replace("/app");
    }
    void checkUser();
  }, [supabase, router]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const trimmed = email.trim();

      if (!trimmed) {
        setError("Please enter your email.");
        setLoading(false);
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
        setError("Enter a valid email address.");
        setLoading(false);
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

      setStatus("Magic link sent. Check your email.");
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#f0ede6]">
      <div className="w-full max-w-md px-6 py-10">
        <div ref={logo} className="mb-8">
          <div className="text-lg font-semibold tracking-tight text-[#c9b87a]">
            tailr
          </div>
        </div>

        <div ref={heading} className="mb-8">
          <h1 className="text-3xl font-semibold leading-tight">Log in</h1>
          <p className="mt-2 text-sm text-[#f0ede6]/50">
            Enter your email to get a magic link.
          </p>
        </div>

        <div ref={form}>
          <form onSubmit={sendMagicLink} className="space-y-3">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#f0ede6]/70"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none transition focus:border-[#c9b87a]/60 focus:bg-white/[0.07]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#c9b87a] px-4 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {status && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
