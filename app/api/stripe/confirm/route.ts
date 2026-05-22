import { syncProfileFromSubscription } from "@/lib/stripeProfile";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type Body = {
  sessionId?: string;
};

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key);
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

    const body = (await request.json()) as Body;
    const sessionId = body.sessionId?.trim();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

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

      const subscription = await stripe.subscriptions.retrieve(subId);
      const admin = getAdminSupabase();

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
        const active = subscription.status === "active" || subscription.status === "trialing";
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ is_pro: active })
          .eq("id", user.id);
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }

      return NextResponse.json({ ok: true, status: subscription.status });
    }

    if (session.mode === "payment" && session.payment_status === "paid") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_pro: true })
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
