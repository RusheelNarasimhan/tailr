import { fetchMultiVariantResumeRawText } from "@/lib/anthropic";
import { parseJsonFromModelText } from "@/lib/latexOutput";
import { renderVariantsFromModel } from "@/lib/renderVariants";
import {
  getCachedTailor,
  isCachedModelPayload,
  setCachedTailor,
  tailorInputHash,
  type CachedTailorModelPayload,
} from "@/lib/resumeCache";
import { parseTailorModelOutput } from "@/lib/tailorModel";
import type { TailorApiSuccessBody } from "@/lib/tailorApi";
import { detectJobDomain, getDomainProfile } from "@/lib/resume/domain";
import { validateJobDescription } from "@/lib/resume/jobInput";
import { ensureUserProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import {
  isLatexTemplateId,
  type LatexTemplateId,
  type OptionalProfileInput,
} from "@/types/resume";
import { NextResponse } from "next/server";

export type { TailorVariantResponse, TailorApiSuccessBody } from "@/lib/tailorApi";

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
  preferOnePage?: boolean;
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
  variants: TailorApiSuccessBody["variants"],
  keywords: TailorApiSuccessBody["keywords"],
  quality: TailorApiSuccessBody["quality"],
  template: LatexTemplateId,
  cached: boolean,
  uses_count: number,
  meta?: {
    detectedDomain?: string;
    domainLabel?: string;
    jobDescriptionWarning?: string | null;
  },
): TailorApiSuccessBody {
  return {
    variants,
    keywords,
    quality,
    template,
    cached,
    uses_count,
    ...meta,
  };
}

async function incrementUses(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  current: number,
): Promise<number> {
  const next = current + 1;
  const { error } = await supabase
    .from("profiles")
    .update({ uses_count: next })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return next;
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

    const { profile, error: profileError } = await ensureUserProfile(supabase, user);

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError ?? "Could not load profile" },
        { status: 500 },
      );
    }

    if (profile.uses_count >= 3 && profile.is_pro === false) {
      return NextResponse.json({ error: "upgrade required" }, { status: 403 });
    }

    const body = (await request.json()) as TailorRequestBody;

    const template: LatexTemplateId =
      body.template && isLatexTemplateId(body.template)
        ? body.template
        : "modern";

    const resumeBullets = toBulletArray(body.resumeBullets);
    const jdCheck = validateJobDescription(body.jobDescription ?? "");

    if (!resumeBullets.length || !jdCheck.valid) {
      return NextResponse.json(
        {
          error:
            jdCheck.warning ??
            "resumeBullets (non-empty) and jobDescription are required",
        },
        { status: 400 },
      );
    }

    const jobDescription = jdCheck.jobDescription;
    const detectedDomain = detectJobDomain(jobDescription);
    const domainLabel = getDomainProfile(detectedDomain).label;

    const preferOnePage = body.preferOnePage !== false;

    const generationMeta = {
      detectedDomain,
      domainLabel,
      jobDescriptionWarning: jdCheck.warning,
    };

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

    if (
      process.env.TAILOR_MOCK_RESPONSE === "1" &&
      process.env.NODE_ENV === "development"
    ) {
      const mockVariant = (n: number) => ({
        label: `Mock ${n}`,
        latex: `\\documentclass{article}\\begin{document}Mock ${n}\\end{document}`,
        docx: Buffer.from("test").toString("base64"),
      });
      const uses_count = await incrementUses(
        supabase,
        user.id,
        profile.uses_count,
      );
      return NextResponse.json(
        buildSuccessBody(
          [mockVariant(1), mockVariant(2), mockVariant(3)],
          { skills: [], tools: [], actionVerbs: [] },
          { score: 80, feedback: ["Mock feedback"] },
          template,
          false,
          uses_count,
          generationMeta,
        ),
      );
    }

    const cacheKey = tailorInputHash(
      jobDescription,
      resumeBullets,
      template,
      optionalProfile,
      preferOnePage,
    );
    const cachedModel = await getCachedTailor(cacheKey);
    if (cachedModel) {
      const variants = await renderVariantsFromModel(
        cachedModel,
        template,
        optionalProfile,
        preferOnePage,
      );
      const uses_count = await incrementUses(
        supabase,
        user.id,
        profile.uses_count,
      );
      return NextResponse.json(
        buildSuccessBody(
          variants,
          cachedModel.keywords,
          cachedModel.quality,
          template,
          true,
          uses_count,
          generationMeta,
        ),
      );
    }

    const modelText = await fetchMultiVariantResumeRawText({
      jobDescription,
      resumeBullets,
      optionalProfile,
      preferOnePage,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[tailor] model response length:", modelText.length);
    }

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

    const modelPayload: CachedTailorModelPayload = {
      schemaVersion: 4,
      template,
      keywords: {
        skills: parsed.keywords.skills,
        tools: parsed.keywords.tools,
        actionVerbs: parsed.keywords.actionVerbs,
      },
      quality: parsed.quality,
      variants: parsed.variants.map((v) => ({
        label: v.label,
        resume: v.resume,
      })),
    };

    const variants = await renderVariantsFromModel(
      modelPayload,
      template,
      optionalProfile,
      preferOnePage,
    );

    await setCachedTailor(cacheKey, modelPayload);

    const uses_count = await incrementUses(
      supabase,
      user.id,
      profile.uses_count,
    );

    return NextResponse.json(
      buildSuccessBody(
        variants,
        modelPayload.keywords,
        modelPayload.quality,
        template,
        false,
        uses_count,
        generationMeta,
      ),
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[tailor] UNHANDLED:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
