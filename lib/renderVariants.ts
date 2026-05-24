import { generateDocxResume } from "@/lib/docx";
import { generateLatexResume } from "@/lib/latex";
import { sanitizeResumeForExport } from "@/lib/resume/sanitize";
import { trimResumeForTemplate } from "@/lib/resumeTrim";
import type { CachedTailorModelPayload } from "@/lib/resumeCache";
import {
  assertResumeDataUsable,
  mergeOptionalProfile,
  normalizeResumeData,
  type LatexTemplateId,
  type OptionalProfileInput,
} from "@/types/resume";
import type { TailorVariantResponse } from "@/lib/tailorApi";

export async function renderVariantsFromModel(
  model: CachedTailorModelPayload,
  template: LatexTemplateId,
  optionalProfile: OptionalProfileInput,
  preferOnePage?: boolean,
): Promise<TailorVariantResponse[]> {
  const out: TailorVariantResponse[] = [];

  for (const entry of model.variants) {
    let data = normalizeResumeData(entry.resume);
    data = mergeOptionalProfile(data, optionalProfile);
    data = sanitizeResumeForExport(data);
    data = trimResumeForTemplate(data, template, preferOnePage);
    assertResumeDataUsable(data);

    const latex = generateLatexResume(data, template);
    const docxBuffer = await generateDocxResume(data, template);
    out.push({
      label: entry.label,
      latex,
      docx: Buffer.from(docxBuffer).toString("base64"),
    });
  }

  return out;
}
