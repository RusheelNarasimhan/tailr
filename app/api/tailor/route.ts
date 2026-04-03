import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, LATEX_RESUME_SYSTEM_PROMPT } from "@/lib/anthropic";
import { stripMarkdownFences } from "@/lib/latexOutput";
import { NextResponse } from "next/server";

type TailorResumePayload = {
  resumeBullets?: string;
  jobDescription?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
};

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

    const body = (await request.json()) as TailorResumePayload;
    const resumeBullets = body.resumeBullets?.trim();
    const jobDescription = body.jobDescription?.trim();

    if (!resumeBullets || !jobDescription) {
      return NextResponse.json(
        { error: "resumeBullets and jobDescription are required" },
        { status: 400 },
      );
    }

    const userInputJson = JSON.stringify({
      name: body.name?.trim() || undefined,
      email: body.email?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      location: body.location?.trim() || undefined,
      linkedin: body.linkedin?.trim() || undefined,
      jobDescription,
      resumeBullets,
    });

    const anthropic = getAnthropicClient();

    const completion = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: LATEX_RESUME_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Data:\n${userInputJson}\n\nOutput:\nReturn ONLY valid LaTeX code.`,
        },
      ],
    });

    const raw = completion.content
      .map((block) => ("text" in block ? block.text : ""))
      .join("")
      .trim();

    const result = stripMarkdownFences(raw);

    if (!result || !result.includes("\\documentclass")) {
      return NextResponse.json(
        { error: "model did not return valid LaTeX" },
        { status: 500 },
      );
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
