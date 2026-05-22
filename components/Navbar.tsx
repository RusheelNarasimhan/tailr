"use client";

import Logo from "@/components/Logo";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type NavbarProps = {
  isPro?: boolean;
  onUpgrade?: () => void;
  onManageSubscription?: () => void;
  billingLoading?: boolean;
};

export default function Navbar({
  isPro,
  onUpgrade,
  onManageSubscription,
  billingLoading,
}: NavbarProps) {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070708]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Logo href="/app" />
        <div className="flex items-center gap-3">
          {!loading && user && (
            <>
              {isPro ? (
                <>
                  <span className="hidden rounded-full border border-[#c9b87a]/35 bg-[#c9b87a]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9b87a] sm:inline">
                    Pro
                  </span>
                  {onManageSubscription ? (
                    <button
                      type="button"
                      onClick={onManageSubscription}
                      disabled={billingLoading}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-[#f0ede6]/70 transition hover:border-white/20 hover:text-[#f0ede6] disabled:opacity-50 sm:px-3"
                    >
                      {billingLoading ? "Opening…" : "Manage subscription"}
                    </button>
                  ) : null}
                </>
              ) : onUpgrade ? (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="hidden rounded-lg border border-[#c9b87a]/40 bg-[#c9b87a]/10 px-3 py-1.5 text-xs font-medium text-[#c9b87a] transition hover:bg-[#c9b87a]/20 sm:inline"
                >
                  Upgrade
                </button>
              ) : null}
              <span className="hidden max-w-[180px] truncate text-xs text-[#f0ede6]/45 lg:block">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#f0ede6]/60 transition hover:border-white/20 hover:text-[#f0ede6]"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
