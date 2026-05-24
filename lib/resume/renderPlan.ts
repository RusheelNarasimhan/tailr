import type { ExperienceLevel } from "@/lib/resume/experienceLevel";
import { shouldIncludeSummary } from "@/lib/resume/experienceLevel";
import { getSectionOrder, type ResumeSectionId } from "@/lib/resume/sectionOrder";
import type { ResumeData } from "@/types/resume";

export function buildRenderSectionOrder(
  data: ResumeData,
  level: ExperienceLevel,
): ResumeSectionId[] {
  return getSectionOrder(level).filter((id) => {
    if (id === "summary") return data.summary.trim().length > 0;
    if (id === "projects") {
      return (data.projects ?? []).some((p) => p.name || p.bullets.length > 0);
    }
    if (id === "education") return data.education.length > 0;
    if (id === "skills") return data.skills.some((g) => g.items.length > 0);
    if (id === "experience") return true;
    return true;
  });
}

export function includeSummaryField(
  level: ExperienceLevel,
  data: ResumeData,
): boolean {
  return shouldIncludeSummary(level, "general") && data.summary.trim().length > 0;
}
