"use client";

import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import OutputPanel, { type TailorOutput } from "@/components/OutputPanel";
import TailorForm from "@/components/TailorForm";
import UpgradeModal from "@/components/UpgradeModal";
import UsageBar from "@/components/UsageBar";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type Profile = {
  uses_count: number;
  is_pro: boolean;
};

// Improved fade-in (IntersectionObserver)
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`;
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

function AppPageInner() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [output, setOutput] = useState<TailorOutput | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const header = useFadeIn(50);
  const formRef = useFadeIn(150);
  const outputRef = useFadeIn(250);

  const searchParams = useSearchParams();

  // After Stripe checkout: confirm payment server-side (webhooks don't hit localhost).
  useEffect(() => {
    const upgraded = searchParams.get("upgraded") === "true";
    const sessionId = searchParams.get("session_id");

    if (!upgraded) return;

    setToast("You're now on Pro — unlimited tailoring unlocked 🎉");
    const toastTimer = setTimeout(() => setToast(null), 4000);

    if (sessionId) {
      void (async () => {
        try {
          const res = await fetch("/api/stripe/confirm", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const payload = (await res.json()) as { ok?: boolean; error?: string };

          if (!res.ok) {
            setToast(
              payload.error
                ? `Upgrade could not be confirmed: ${payload.error}`
                : "Upgrade could not be confirmed. Try refreshing or contact support.",
            );
            return;
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const { data } = await supabase
            .from("profiles")
            .select("uses_count,is_pro")
            .eq("id", user.id)
            .single();

          if (data) setProfile(data as Profile);
          router.replace("/app");
        } catch {
          setToast("Upgrade confirmation failed. Check your connection and try again.");
        }
      })();
    }

    return () => clearTimeout(toastTimer);
  }, [searchParams, supabase, router]);

  // Handle checkout trigger (prevent duplicate calls)
  useEffect(() => {
    if (searchParams.get("checkout") === "true") {
      const controller = new AbortController();

      fetch("/api/stripe/checkout", {
        method: "POST",
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: { url?: string }) => {
          if (data.url) window.location.href = data.url;
        })
        .catch(() => {});

      return () => controller.abort();
    }
  }, [searchParams]);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfileLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("uses_count,is_pro")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data as Profile);
      setProfileLoading(false);
    }

    void fetchProfile();
  }, [supabase]);

  function handleResult(payload: TailorOutput) {
    setOutput(payload);

    setProfile((prev) =>
      prev ? { ...prev, uses_count: prev.uses_count + 1 } : prev
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-[#f0ede6]">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div
          ref={header}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Resume Tailor
            </h1>
            <p className="mt-1 text-sm text-[#f0ede6]/50">
              Paste your bullets and a job description. Get structured LaTeX (PDF) and Word (.docx) in one run.
            </p>
          </div>

          {profileLoading ? (
            <div className="h-8 w-36 animate-pulse rounded-lg bg-white/5" />
          ) : profile ? (
            <UsageBar usesCount={profile.uses_count} isPro={profile.is_pro} />
          ) : null}
        </div>

        <div ref={formRef}>
          <TailorForm
            onResult={handleResult}
            onUpgradeRequired={() => setShowUpgrade(true)}
          />
        </div>

        <div ref={outputRef}>
          <OutputPanel output={output} />
        </div>
      </main>

      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-[#c9b87a]/30 bg-[#111] px-5 py-3 text-sm text-[#c9b87a] shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense>
      <AppPageInner />
    </Suspense>
  );
}
