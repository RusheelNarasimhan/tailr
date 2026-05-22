import { ensureBillingCustomer } from "@/lib/stripeBilling";
import { ensureUserProfile } from "@/lib/profiles";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function resolveAppOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin.replace(/\/$/, "");
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return envUrl ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { profile, error: profileError } = await ensureUserProfile(supabase, user);

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError ?? "Could not load profile" },
        { status: 500 },
      );
    }

    if (!profile.is_pro) {
      return NextResponse.json(
        { error: "Subscribe to Pro to manage your subscription." },
        { status: 400 },
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs an email address to open billing." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const { customerId, error: resolveError, hasActiveSubscription } =
      await ensureBillingCustomer(stripe, user.id, user.email, profile);

    if (!customerId) {
      return NextResponse.json(
        { error: resolveError ?? "No billing account found." },
        { status: 400 },
      );
    }

    if (!hasActiveSubscription) {
      return NextResponse.json({
        legacyPro: true as const,
        message:
          "Your Pro access is not tied to a monthly Stripe subscription (for example a one-time upgrade). There is nothing to cancel in Stripe. Contact support if you want Pro removed, or subscribe monthly on a new checkout when available.",
      });
    }

    const appUrl = resolveAppOrigin(request);

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/app`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[stripe/portal]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
