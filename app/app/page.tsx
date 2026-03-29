"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import OutputPanel from "@/components/OutputPanel";
import TailorForm from "@/components/TailorForm";
import UpgradeModal from "@/components/UpgradeModal";
import UsageBar from "@/components/UsageBar";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Profile = {
  uses_count: number;
  is_pro: boolean;
};

function AppPageInner() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setToast("You're now on Pro — unlimited tailoring unlocked 🎉");
      setTimeout(() => setToast(null), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("uses_count,is_pro")
        .eq("id", user.id)
        .single();
      console.log("profile data", data, "error", error);
      if (data) setProfile(data as Profile);
      setProfileLoading(false);
    }
    void fetchProfile();
  }, [supabase]);

  function handleResult(res: string) {
    setResult(res);
    setProfile((prev) =>
      prev ? { ...prev, uses_count: prev.uses_count + 1 } : prev
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-[#f0ede6]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Resume Tailor
            </h1>
            <p className="mt-1 text-sm text-[#f0ede6]/50">
              Paste your bullets and a job description. Get ATS-optimized rewrites instantly.
            </p>
          </div>
          {profileLoading ? (
            <div className="h-8 w-36 animate-pulse rounded-lg bg-white/5" />
          ) : profile ? (
            <UsageBar usesCount={profile.uses_count} isPro={profile.is_pro} />
          ) : null}
        </div>
        <TailorForm
          onResult={handleResult}
          onUpgradeRequired={() => setShowUpgrade(true)}
        />
        <OutputPanel result={result} />
      </main>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
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