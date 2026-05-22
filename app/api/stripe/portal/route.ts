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
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to Pro first." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const appUrl = resolveAppOrigin(request);

    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/app`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
