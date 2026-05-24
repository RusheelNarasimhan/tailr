import type { ExperienceLevel } from "@/lib/resume/experienceLevel";

export type ResumeSectionId =
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills";

const ORDERS: Record<ExperienceLevel, ResumeSectionId[]> = {
  student_new_grad: ["education", "experience", "projects", "skills"],
  no_technical_experience: ["education", "projects", "experience", "skills"],
  experienced_engineer: ["experience", "skills", "education", "projects"],
  career_changer: ["summary", "experience", "projects", "skills", "education"],
};

export function getSectionOrder(level: ExperienceLevel): ResumeSectionId[] {
  return [...ORDERS[level]];
}

export function sectionTitle(
  id: ResumeSectionId,
  level?: ExperienceLevel,
): string {
  switch (id) {
    case "summary":
      return "Summary";
    case "education":
      return "Education";
    case "experience":
      return level === "career_changer" ? "Relevant Experience" : "Experience";
    case "projects":
      return "Projects";
    case "skills":
      return "Skills";
    default:
      return id;
  }
}
