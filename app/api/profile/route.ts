import { ensureUserProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { profile, error } = await ensureUserProfile(supabase, user);

    if (error || !profile) {
      return NextResponse.json(
        { error: error ?? "Could not load profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
