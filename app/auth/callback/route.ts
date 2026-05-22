import {
  applyNextPathToUrl,
  safeNextPath,
} from "@/lib/authRedirect";
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function loginRedirectWithError(
  origin: string,
  message: string,
): NextResponse {
  const url = new URL("/auth/login", origin);
  url.searchParams.set("error", "oauth");
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  const oauthDescription =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error_code");

  if (oauthError) {
    const msg =
      oauthDescription ??
      "Google sign-in was cancelled or could not be completed.";
    return loginRedirectWithError(url.origin, msg);
  }

  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] exchangeCodeForSession:", error.message);
      return loginRedirectWithError(
        url.origin,
        error.message || "Could not complete sign-in. Try again.",
      );
    }
  }

  const redirectUrl = applyNextPathToUrl(new URL(url.origin), next);
  return NextResponse.redirect(redirectUrl);
}
