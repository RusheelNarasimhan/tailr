import type { LatexTemplateId } from "@/types/resume";

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
  uses_count: number;
  detectedDomain?: string;
  domainLabel?: string;
  jobDescriptionWarning?: string | null;
};
