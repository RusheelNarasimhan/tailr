import { getServiceSupabase } from "@/lib/supabase/admin";
import { syncProfileFromSubscription } from "@/lib/stripeProfile";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

type Body = {
  sessionId?: string;
};

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

    const body = (await request.json()) as Body;
    const sessionId = body.sessionId?.trim();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    const sessionUserId = session.metadata?.userId ?? session.client_reference_id;
    if (!sessionUserId || sessionUserId !== user.id) {
      return NextResponse.json(
        { error: "session does not belong to this user" },
        { status: 403 },
      );
    }

    if (session.mode === "subscription") {
      if (!session.subscription) {
        return NextResponse.json(
          { error: "subscription not found on session" },
          { status: 400 },
        );
      }

      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      const subscription =
        typeof session.subscription === "object" && session.subscription
          ? session.subscription
          : await stripe.subscriptions.retrieve(subId);

      const admin = getServiceSupabase();
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : typeof session.customer === "object" && session.customer
            ? session.customer.id
            : typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

      if (admin) {
        const { error: syncError } = await syncProfileFromSubscription(
          admin,
          user.id,
          subscription,
        );
        if (syncError) {
          return NextResponse.json({ error: syncError }, { status: 500 });
        }
      } else {
        const active =
          subscription.status === "active" || subscription.status === "trialing";
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            is_pro: active,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq("id", user.id);
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }

      return NextResponse.json({ ok: true, status: subscription.status });
    }

    if (session.mode === "payment" && session.payment_status === "paid") {
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : typeof session.customer === "object" && session.customer
            ? session.customer.id
            : null;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_pro: true,
          ...(customerId ? { stripe_customer_id: customerId } : {}),
        })
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "checkout not completed" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
