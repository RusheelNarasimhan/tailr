// Register in Stripe Dashboard → Webhooks:
// checkout.session.completed
// customer.subscription.updated
// customer.subscription.deleted

import {
  revokeProBySubscriptionId,
  syncProfileFromSubscription,
  resolveUserIdFromSubscription,
} from "@/lib/stripeProfile";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("missing supabase env vars");
  }
  return createClient(supabaseUrl, serviceKey);
}

async function handleSubscription(
  stripe: ReturnType<typeof getStripe>,
  subscriptionId: string,
  sessionUserId?: string | null,
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = resolveUserIdFromSubscription(subscription, sessionUserId);

  if (!userId) {
    throw new Error(`no userId for subscription ${subscriptionId}`);
  }

  const admin = getAdminSupabase();
  const { error } = await syncProfileFromSubscription(
    admin,
    userId,
    subscription,
  );
  if (error) throw new Error(error);
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "missing signature or secret" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;

      if (session.mode === "subscription" && session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        await handleSubscription(stripe, subId, userId);
      } else if (session.mode === "payment" && userId) {
        const admin = getAdminSupabase();
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : null;
        await admin
          .from("profiles")
          .update({
            is_pro: true,
            ...(customerId ? { stripe_customer_id: customerId } : {}),
          })
          .eq("id", userId);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = resolveUserIdFromSubscription(subscription, null);
      if (userId) {
        const admin = getAdminSupabase();
        await syncProfileFromSubscription(admin, userId, subscription);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const admin = getAdminSupabase();
      const userId = resolveUserIdFromSubscription(subscription, null);

      if (userId) {
        await admin
          .from("profiles")
          .update({
            is_pro: false,
            subscription_status: subscription.status,
          })
          .eq("id", userId);
      } else {
        await revokeProBySubscriptionId(
          admin,
          subscription.id,
          subscription.status,
        );
      }
    }

  } catch (e) {
    const message = e instanceof Error ? e.message : "webhook handler error";
    console.error("[stripe/webhook]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
