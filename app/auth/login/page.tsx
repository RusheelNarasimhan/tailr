"use client";

import { formatAuthError } from "@/lib/authErrors";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type AuthMode = "signin" | "signup";

function getRedirectPath(searchParams: URLSearchParams): string {
  const next = searchParams.get("next");
  if (next) return decodeURIComponent(next);
  if (searchParams.get("intent") === "upgrade") return "/app?checkout=true";
  return "/app";
}

function LoginPageInner() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode: AuthMode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.replace(getRedirectPath(searchParams));
    }
    void checkUser();
  }, [supabase, router, searchParams]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setStatus(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Enter your email above, then click Send reset link.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      { redirectTo },
    );

    setLoading(false);

    if (resetError) {
      setError(formatAuthError(resetError, "signin"));
      return;
    }

    setStatus("Password reset email sent. Open the link, set a password, then sign in.");
    setForgotMode(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setStatus(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(getRedirectPath(searchParams))}`;

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { emailRedirectTo: redirectTo },
        });

        if (signUpError) throw signUpError;

        if (data.user?.identities?.length === 0) {
          setError(
            "This email is already registered. Sign in, or use Forgot password if you never set one.",
          );
          switchMode("signin");
          return;
        }

        if (data.session) {
          router.replace(getRedirectPath(searchParams));
          return;
        }

        setStatus(
          "Account created — check your email to confirm (including spam), then sign in here.",
        );
        switchMode("signin");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) throw signInError;

      router.replace(getRedirectPath(searchParams));
    } catch (err) {
      setError(formatAuthError(err, mode));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#f0ede6]">
      <div className="w-full max-w-md px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#c9b87a] transition hover:opacity-80"
          >
            tailr
          </Link>
        </div>

        <div className="mb-6 flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signin"
                ? "bg-[#c9b87a] text-[#0a0a0a]"
                : "text-[#f0ede6]/60 hover:text-[#f0ede6]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-[#c9b87a] text-[#0a0a0a]"
                : "text-[#f0ede6]/60 hover:text-[#f0ede6]"
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold leading-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-[#f0ede6]/50">
            {mode === "signin"
              ? "Sign in with your email and password."
              : "Start tailoring resumes in seconds."}
          </p>
        </div>

        <form
          onSubmit={forgotMode ? handleForgotPassword : handleSubmit}
          className="space-y-3"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#f0ede6]/70">
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

          {forgotMode ? null : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#f0ede6]/70"
                >
                  Password
                </label>
                {mode === "signin" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setError(null);
                      setStatus(null);
                    }}
                    className="text-xs text-[#c9b87a] hover:underline"
                  >
                    Forgot password?
                  </button>
                ) : null}
              </div>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none transition focus:border-[#c9b87a]/60 focus:bg-white/[0.07]"
              />
            </div>
          )}

          {mode === "signup" && !forgotMode ? (
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#f0ede6]/70"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none transition focus:border-[#c9b87a]/60 focus:bg-white/[0.07]"
              />
            </div>
          ) : null}

          {forgotMode ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#c9b87a] px-4 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-sm text-[#f0ede6]/50 hover:text-[#f0ede6]"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#c9b87a] px-4 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          )}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
