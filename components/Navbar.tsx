"use client";

import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

export default function Navbar() {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <Link href="/" className="text-base font-semibold tracking-tight text-[#c9b87a] hover:opacity-80 transition">
        tailr
      </Link>
      <div className="flex items-center gap-4">
        {!loading && user && (
          <>
            <Link
              href="/app"
              className="text-xs text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
            >
              Tailor
            </Link>
            <span className="hidden text-xs text-[#f0ede6]/50 sm:block">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#f0ede6]/70 transition hover:border-white/20 hover:text-[#f0ede6]"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
