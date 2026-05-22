import { ensureUserProfile } from "@/lib/profiles";
import { getProPriceLabel } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

function resolveAppOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin.replace(/\/$/, "");
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* ignore */
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;
  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRO_PRICE_ID?.trim();
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "STRIPE_PRO_PRICE_ID is not configured. Create a monthly price in Stripe and add it to env.",
        },
        { status: 500 },
      );
    }

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

    if (profile.is_pro === true) {
      return NextResponse.json({ alreadyPro: true as const });
    }

    const appUrl = resolveAppOrigin(request);
    const stripe = getStripe();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
      success_url: `${appUrl}/app?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app`,
      ...(profile.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : {
            customer_email: user.email ?? undefined,
            customer_creation: "always",
          }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      plan: getProPriceLabel(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
