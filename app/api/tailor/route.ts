import { fetchMultiVariantResumeRawText } from "@/lib/anthropic";
import { generateDocxResume } from "@/lib/docx";
import { generateLatexResume } from "@/lib/latex";
import { parseJsonFromModelText } from "@/lib/latexOutput";
import {
  getCachedTailor,
  setCachedTailor,
  tailorInputHash,
} from "@/lib/resumeCache";
import { parseTailorModelOutput } from "@/lib/tailorModel";
import { createClient } from "@/lib/supabase/server";
import {
  assertResumeDataUsable,
  isLatexTemplateId,
  mergeOptionalProfile,
  normalizeResumeData,
  type LatexTemplateId,
  type OptionalProfileInput,
} from "@/types/resume";
import { NextResponse } from "next/server";

type TailorRequestBody = {
  resumeBullets?: string | string[];
  jobDescription?: string;
  template?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  school?: string;
  degree?: string;
  graduationDate?: string;
};

export type TailorVariantResponse = {
  label: string;
  latex: string;
  docx: string;
};

export type TailorApiSuccessBody = {
  variants: TailorVariantResponse[];
  keywords: {
    skills: string[];
    tools: string[];
    actionVerbs: string[];
  };
  quality: { score: number; feedback: string[] };
  template: LatexTemplateId;
  cached: boolean;
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

function buildSuccessBody(
  variants: TailorVariantResponse[],
  keywords: TailorApiSuccessBody["keywords"],
  quality: TailorApiSuccessBody["quality"],
  template: LatexTemplateId,
  cached: boolean,
): TailorApiSuccessBody {
  return { variants, keywords, quality, template, cached };
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

    const template: LatexTemplateId =
      body.template && isLatexTemplateId(body.template)
        ? body.template
        : "modern";

    if (process.env.TAILOR_MOCK_RESPONSE === "1") {
      const mockVariant = (n: number): TailorVariantResponse => ({
        label: `Mock ${n}`,
        latex: `\\documentclass{article}\\begin{document}Mock ${n}\\end{document}`,
        docx: Buffer.from("test").toString("base64"),
      });
      return NextResponse.json(
        buildSuccessBody(
          [mockVariant(1), mockVariant(2), mockVariant(3)],
          { skills: [], tools: [], actionVerbs: [] },
          { score: 80, feedback: ["Mock feedback"] },
          template,
          false,
        ),
      );
    }

    const resumeBullets = toBulletArray(body.resumeBullets);
    const jobDescription = body.jobDescription?.trim() ?? "";

    if (!resumeBullets.length || !jobDescription) {
      return NextResponse.json(
        { error: "resumeBullets (non-empty) and jobDescription are required" },
        { status: 400 },
      );
    }

    const optionalProfile: OptionalProfileInput = {
      name: body.name?.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      location: body.location?.trim(),
      linkedin: body.linkedin?.trim(),
      github: body.github?.trim(),
      school: body.school?.trim(),
      degree: body.degree?.trim(),
      graduationDate: body.graduationDate?.trim(),
    };

    const cacheKey = tailorInputHash(jobDescription, resumeBullets, template);
    const cached = await getCachedTailor(cacheKey);
    if (cached && isCachedPayload(cached)) {
      const bodyOut = cached as unknown as TailorApiSuccessBody;
      return NextResponse.json({ ...bodyOut, cached: true });
    }

    const modelText = await fetchMultiVariantResumeRawText({
      jobDescription,
      resumeBullets,
      optionalProfile,
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

    let parsed: ReturnType<typeof parseTailorModelOutput>;
    try {
      parsed = parseTailorModelOutput(rawJson);
    } catch (e) {
      console.error("[tailor] VARIANT PARSE FAILED:", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid variant structure" },
        { status: 422 },
      );
    }

    const outVariants: TailorVariantResponse[] = [];

    for (const entry of parsed.variants) {
      let data = normalizeResumeData(entry.resume);
      data = mergeOptionalProfile(data, optionalProfile);
      try {
        assertResumeDataUsable(data);
      } catch (validationErr) {
        console.error("[tailor] VALIDATION FAILED:", validationErr);
        return NextResponse.json(
          { error: "Invalid resume data after normalization" },
          { status: 422 },
        );
      }

      const latex = generateLatexResume(data, template);
      const docxBuffer = await generateDocxResume(data, template);
      const docx = Buffer.from(docxBuffer).toString("base64");
      outVariants.push({ label: entry.label, latex, docx });
    }

    const responseBody = buildSuccessBody(
      outVariants,
      {
        skills: parsed.keywords.skills,
        tools: parsed.keywords.tools,
        actionVerbs: parsed.keywords.actionVerbs,
      },
      parsed.quality,
      template,
      false,
    );

    await setCachedTailor(cacheKey, responseBody as unknown as Record<string, unknown>);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ uses_count: profile.uses_count + 1 })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(responseBody);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[tailor] UNHANDLED:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isCachedPayload(v: Record<string, unknown>): boolean {
  return (
    Array.isArray(v.variants) &&
    v.variants.length === 3 &&
    typeof v.template === "string"
  );
}
