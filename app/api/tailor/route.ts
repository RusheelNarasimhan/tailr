import { fetchStructuredResumeRawText } from "@/lib/anthropic";
import { generateDocxResume } from "@/lib/docx";
import { generateLatexResume } from "@/lib/latex";
import { parseJsonFromModelText } from "@/lib/latexOutput";
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

    if (process.env.TAILOR_MOCK_RESPONSE === "1") {
      const mockLatex = "\\documentclass{article}\\begin{document}Test\\end{document}";
      const mockDocx = Buffer.from("test").toString("base64");
      return NextResponse.json({ latex: mockLatex, docx: mockDocx });
    }

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

    const modelText = await fetchStructuredResumeRawText({
      jobDescription,
      resumeBullets,
      optionalHeader,
    });

    console.log("[tailor] RAW MODEL OUTPUT:\n", modelText);

    let rawJson: unknown;
    try {
      rawJson = parseJsonFromModelText(modelText);
    } catch (parseErr) {
      console.error("[tailor] JSON PARSE FAILED:", parseErr);
      const detail =
        process.env.NODE_ENV === "development"
          ? parseErr instanceof Error
            ? parseErr.message
            : String(parseErr)
          : undefined;
      return NextResponse.json(
        {
          error: "Model did not return valid JSON",
          ...(detail ? { detail } : {}),
        },
        { status: 502 },
      );
    }

    let data = normalizeResumeData(rawJson);
    data = mergeOptionalHeader(data, optionalHeader);

    try {
      assertResumeDataUsable(data);
    } catch (validationErr) {
      console.error("[tailor] VALIDATION FAILED:", validationErr);
      return NextResponse.json(
        { error: "Invalid resume data after normalization" },
        { status: 422 },
      );
    }

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
    console.error("[tailor] UNHANDLED:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
