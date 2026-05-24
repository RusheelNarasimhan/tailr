import { generateDocxResume } from "@/lib/docx";
import { generateLatexResume } from "@/lib/latex";
import { detectExperienceLevel } from "@/lib/resume/experienceLevel";
import {
  readabilityScore,
  validateResumeQuality,
} from "@/lib/resume/quality";
import { sanitizeResumeForExport } from "@/lib/resume/sanitize";
import { trimResumeForTemplate } from "@/lib/resumeTrim";
import type { CachedTailorModelPayload } from "@/lib/resumeCache";
import {
  assertResumeDataUsable,
  mergeOptionalProfile,
  normalizeResumeData,
  type LatexTemplateId,
  type OptionalProfileInput,
  type ResumeQuality,
} from "@/types/resume";
import type { TailorVariantResponse } from "@/lib/tailorApi";

export type RenderVariantsContext = {
  jobDescription: string;
  resumeBullets: string[];
  graduationDate?: string;
};

function mergeQualityFeedback(
  modelQuality: ResumeQuality,
  data: ReturnType<typeof normalizeResumeData>,
): ResumeQuality {
  const issues = validateResumeQuality(data);
  const localScore = readabilityScore(data);
  const feedback = [
    ...modelQuality.feedback,
    ...issues.map((i) => i.message),
  ].slice(0, 8);
  const score = Math.round((modelQuality.score + localScore) / 2);
  return { score, feedback };
}

export async function renderVariantsFromModel(
  model: CachedTailorModelPayload,
  template: LatexTemplateId,
  optionalProfile: OptionalProfileInput,
  preferOnePage?: boolean,
  context?: RenderVariantsContext,
): Promise<{
  variants: TailorVariantResponse[];
  quality: ResumeQuality;
}> {
  const level =
    model.experienceLevel ??
    detectExperienceLevel({
      jobDescription: context?.jobDescription ?? "",
      resumeBullets: context?.resumeBullets ?? [],
      graduationDate:
        context?.graduationDate ?? optionalProfile.graduationDate,
    });

  const out: TailorVariantResponse[] = [];
  let mergedQuality = model.quality;

  for (const entry of model.variants) {
    let data = normalizeResumeData(entry.resume);
    data = mergeOptionalProfile(data, optionalProfile);
    data = sanitizeResumeForExport(data);
    data = trimResumeForTemplate(data, template, preferOnePage);
    assertResumeDataUsable(data);
    mergedQuality = mergeQualityFeedback(mergedQuality, data);

    const latex = generateLatexResume(data, template, { experienceLevel: level });
    const docxBuffer = await generateDocxResume(data, template, {
      experienceLevel: level,
    });
    out.push({
      label: entry.label,
      latex,
      docx: Buffer.from(docxBuffer).toString("base64"),
    });
  }

  return { variants: out, quality: mergedQuality };
}
