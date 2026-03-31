import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Build the redirect URL properly to preserve query params in `next`
  const redirectUrl = new URL(url.origin);
  const [pathname, query] = next.split("?");
  redirectUrl.pathname = pathname;
  if (query) {
    query.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      redirectUrl.searchParams.set(key, value ?? "");
    });
  }

  return NextResponse.redirect(redirectUrl);
}