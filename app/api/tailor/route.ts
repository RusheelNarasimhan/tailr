import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAnthropicClient, TAILOR_SYSTEM_PROMPT } from "@/lib/anthropic";

type TailorRequestBody = {
  resumeBullets?: string;
  jobDescription?: string;
};

function getMockResult(resumeBullets: string): string {
  const bullets = resumeBullets
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);

  return bullets
    .map(
      (_, i) =>
        `• [MOCK] Tailored bullet ${i + 1} — ATS-optimized and keyword-matched to the job description`
    )
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("uses_count,is_pro")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "profile not found" }, { status: 500 });
    }

    if (profile.uses_count >= 3 && profile.is_pro === false) {
      return NextResponse.json({ error: "upgrade required" }, { status: 403 });
    }

    const body = (await request.json()) as TailorRequestBody;
    const resumeBullets = body.resumeBullets?.trim();
    const jobDescription = body.jobDescription?.trim();

    if (!resumeBullets || !jobDescription) {
      return NextResponse.json(
        { error: "resumeBullets and jobDescription are required" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

const completion = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  system: TAILOR_SYSTEM_PROMPT,
  messages: [
    {
      role: "user",
      content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME BULLETS TO REWRITE:\n${resumeBullets}\n\nRewrite these bullets to match the job description.`,
    },
  ],
});

const result = completion.content
  .map((block) => ("text" in block ? block.text : ""))
  .join("")
  .trim();

if (!result) {
  return NextResponse.json({ error: "empty result from model" }, { status: 500 });
}

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ uses_count: profile.uses_count + 1 })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}