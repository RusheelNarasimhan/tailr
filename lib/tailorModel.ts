import type { JobKeywords, ResumeQuality } from "@/types/resume";
import { normalizeJobKeywords, normalizeQuality } from "@/types/resume";

export type VariantEntryRaw = {
  label: string;
  resume: unknown;
};

export function parseTailorModelOutput(raw: unknown): {
  keywords: JobKeywords;
  variants: VariantEntryRaw[];
  quality: ResumeQuality;
} {
  if (!raw || typeof raw !== "object") {
    throw new Error("Model root must be an object");
  }
  const o = raw as Record<string, unknown>;

  const keywords = normalizeJobKeywords(o.keywords);
  const quality = normalizeQuality(o.quality);

  const varArr = Array.isArray(o.variants) ? o.variants : [];
  const variants: VariantEntryRaw[] = [];

  for (let i = 0; i < varArr.length; i++) {
    const v = varArr[i];
    if (!v || typeof v !== "object") continue;
    const x = v as Record<string, unknown>;
    const label =
      typeof x.label === "string" && x.label.trim()
        ? x.label.trim()
        : `Variant ${i + 1}`;
    variants.push({ label, resume: x.resume });
  }

  if (variants.length < 3) {
    throw new Error(`Expected at least 3 variants, got ${variants.length}`);
  }

  return { keywords, variants: variants.slice(0, 3), quality };
}
