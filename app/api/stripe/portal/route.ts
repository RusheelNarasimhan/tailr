import {
  ensureBillingCustomer,
  type ProfileBillingRow,
} from "@/lib/stripeBilling";
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_pro,stripe_customer_id,stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "profile not found" }, { status: 500 });
    }

    const row = profile as ProfileBillingRow;

    if (!row.is_pro) {
      return NextResponse.json(
        { error: "Subscribe to Pro to manage billing." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const { customerId, error: resolveError } = await ensureBillingCustomer(
      stripe,
      user.id,
      user.email,
      row,
    );

    if (!customerId) {
      return NextResponse.json(
        { error: resolveError ?? "No billing account found." },
        { status: 400 },
      );
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
