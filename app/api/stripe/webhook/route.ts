// PRODUCTION NOTE: Register this endpoint in the Stripe dashboard under
// Developers → Webhooks → Add endpoint → https://yourdomain.com/api/stripe/webhook
// Select event: checkout.session.completed

import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "missing signature or secret" }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  const userId = session.metadata?.userId;

  console.log("webhook: userId from metadata", userId);

  if (!userId) {
    return NextResponse.json({ error: "no userId in metadata" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("webhook: supabaseUrl", supabaseUrl, "serviceKey exists", !!serviceKey);

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "missing supabase env vars" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase
    .from("profiles")
    .update({ is_pro: true })
    .eq("id", userId);

  console.log("webhook: update error", error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

  return NextResponse.json({ received: true });
}
