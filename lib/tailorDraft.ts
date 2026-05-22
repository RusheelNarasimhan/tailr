import type { LatexTemplateId } from "@/types/resume";

const STORAGE_KEY = "tailr-draft-v1";

export type TailorDraft = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  school: string;
  degree: string;
  graduationDate: string;
  resumeBullets: string;
  jobDescription: string;
  template: LatexTemplateId;
  preferOnePage: boolean;
};

export const EMPTY_DRAFT: TailorDraft = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  school: "",
  degree: "",
  graduationDate: "",
  resumeBullets: "",
  jobDescription: "",
  template: "compact",
  preferOnePage: true,
};

export function loadTailorDraft(): TailorDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TailorDraft>;
    return { ...EMPTY_DRAFT, ...parsed };
  } catch {
    return null;
  }
}

export function saveTailorDraft(draft: TailorDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota or private mode */
  }
}

export function clearTailorDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasDraftContent(draft: TailorDraft): boolean {
  return Boolean(
    draft.resumeBullets.trim() ||
      draft.jobDescription.trim() ||
      draft.name.trim() ||
      draft.github.trim(),
  );
}
