import { fetchStructuredResumeJson } from "@/lib/anthropic";
import { generateDocxResume } from "@/lib/docx";
import { generateLatexResume } from "@/lib/latex";
import { createClient } from "@/lib/supabase/server";
import {
  assertResumeDataUsable,
  mergeOptionalHeader,
  normalizeResumeData,
  type ResumeHeader,
} from "@/types/resume";
import { NextResponse } from "next/server";

type TailorRequestBody = {
  resumeBullets?: string | string[];
  jobDescription?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
};

function toBulletArray(raw: string | string[] | undefined): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-•*\d.)\s]+/u, "").trim())
      .filter(Boolean);
  }
  return [];
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
    const resumeBullets = toBulletArray(body.resumeBullets);
    const jobDescription = body.jobDescription?.trim() ?? "";

    if (!resumeBullets.length || !jobDescription) {
      return NextResponse.json(
        { error: "resumeBullets (non-empty) and jobDescription are required" },
        { status: 400 },
      );
    }

    const optionalHeader: Partial<ResumeHeader> = {
      name: body.name?.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      location: body.location?.trim(),
      linkedin: body.linkedin?.trim(),
    };

    const rawJson = await fetchStructuredResumeJson({
      jobDescription,
      resumeBullets,
      optionalHeader,
    });

    let data = normalizeResumeData(rawJson);
    data = mergeOptionalHeader(data, optionalHeader);
    assertResumeDataUsable(data);

    const latex = generateLatexResume(data);
    const docxBuffer = await generateDocxResume(data);
    const docx = Buffer.from(docxBuffer).toString("base64");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ uses_count: profile.uses_count + 1 })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ latex, docx });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
