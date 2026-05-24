import { detectJobDomain, type JobDomain } from "@/lib/resume/domain";

export type ExperienceLevel =
  | "student_new_grad"
  | "no_technical_experience"
  | "experienced_engineer"
  | "career_changer";

const TECH_SIGNALS =
  /\b(engineer|developer|software|api|react|typescript|python|java|backend|frontend|full[\s-]?stack|devops|database|kubernetes|aws|git|sql|node\.?js)\b/i;

const PROJECT_SIGNALS =
  /\b(project|built|developed|implemented|platform|app|application|prototype|hackathon|capstone)\b/i;

export function detectExperienceLevel(input: {
  jobDescription: string;
  resumeBullets: string[];
  graduationDate?: string;
  hasTechnicalExperience?: boolean;
}): ExperienceLevel {
  const bullets = input.resumeBullets.join("\n").toLowerCase();
  const jd = input.jobDescription.toLowerCase();

  const careerChange =
    /\b(career change|career transition|transitioning|pivot|switching careers)\b/i.test(
      jd,
    ) || /\b(career change|transition)\b/i.test(bullets);

  if (careerChange) {
    return "career_changer";
  }

  const gradYear = parseGraduationYear(input.graduationDate);
  const currentYear = new Date().getFullYear();
  const isStudent =
    /\b(student|new grad|recent grad|intern|co-op|coursework)\b/i.test(jd) ||
    /\b(student|intern|coursework|university|college)\b/i.test(bullets) ||
    (gradYear !== null && gradYear >= currentYear - 1);

  const techBulletCount = input.resumeBullets.filter(
    (b) => TECH_SIGNALS.test(b) || PROJECT_SIGNALS.test(b),
  ).length;

  const hasTechExp =
    input.hasTechnicalExperience ??
    techBulletCount >= Math.max(1, Math.ceil(input.resumeBullets.length * 0.35));

  if (isStudent && !hasTechExp) {
    return "no_technical_experience";
  }

  if (isStudent) {
    return "student_new_grad";
  }

  if (!hasTechExp) {
    return "no_technical_experience";
  }

  return "experienced_engineer";
}

function parseGraduationYear(raw?: string): number | null {
  if (!raw?.trim()) return null;
  const m = raw.match(/\b(20\d{2})\b/);
  return m ? Number(m[1]) : null;
}

export function shouldIncludeSummary(
  level: ExperienceLevel,
  domain: JobDomain,
): boolean {
  return level === "career_changer" || (level === "experienced_engineer" && domain === "product_management");
}
