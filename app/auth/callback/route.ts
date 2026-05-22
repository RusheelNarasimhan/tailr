import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_NEXT = new Set(["/app", "/app?checkout=true"]);

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/app";
  const pathOnly = raw.split("?")[0];
  if (pathOnly !== "/app") return "/app";
  if (ALLOWED_NEXT.has(raw)) return raw;
  if (raw.startsWith("/app?") && raw.includes("checkout=true")) return "/app?checkout=true";
  return "/app";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectUrl = new URL(url.origin);
  const [pathname, query] = next.split("?");
  redirectUrl.pathname = pathname;
  if (query) {
    query.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) redirectUrl.searchParams.set(key, value ?? "");
    });
  }

  return NextResponse.redirect(redirectUrl);
}
