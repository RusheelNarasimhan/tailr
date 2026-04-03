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
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== "payment") {
      return NextResponse.json({ error: "invalid session mode" }, { status: 400 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "payment not completed" }, { status: 400 });
    }

    const sessionUserId = session.metadata?.userId ?? session.client_reference_id;
    if (!sessionUserId || sessionUserId !== user.id) {
      return NextResponse.json(
        { error: "session does not belong to this user" },
        { status: 403 },
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ is_pro: true })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json(
        { error: "no profile row updated; check RLS and that profiles.id matches auth user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
