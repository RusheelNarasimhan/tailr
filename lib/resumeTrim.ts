import type { LatexTemplateId, ResumeData } from "@/types/resume";

type TrimLimits = {
  summaryMax: number;
  maxEducation: number;
  maxSkillGroups: number;
  maxItemsPerSkill: number;
  maxRoles: number;
  maxBulletsPerRole: number;
  maxProjects: number;
  maxBulletsPerProject: number;
};

const LIMITS: Record<LatexTemplateId, TrimLimits> = {
  compact: {
    summaryMax: 380,
    maxEducation: 2,
    maxSkillGroups: 6,
    maxItemsPerSkill: 10,
    maxRoles: 4,
    maxBulletsPerRole: 5,
    maxProjects: 3,
    maxBulletsPerProject: 3,
  },
  modern: {
    summaryMax: 520,
    maxEducation: 3,
    maxSkillGroups: 8,
    maxItemsPerSkill: 14,
    maxRoles: 5,
    maxBulletsPerRole: 6,
    maxProjects: 4,
    maxBulletsPerProject: 4,
  },
  academic: {
    summaryMax: 600,
    maxEducation: 4,
    maxSkillGroups: 8,
    maxItemsPerSkill: 16,
    maxRoles: 6,
    maxBulletsPerRole: 7,
    maxProjects: 5,
    maxBulletsPerProject: 5,
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function effectiveLimits(
  template: LatexTemplateId,
  preferOnePage?: boolean,
): TrimLimits {
  const base = LIMITS[template];
  if (!preferOnePage) return base;
  return {
    summaryMax: Math.min(280, Math.floor(base.summaryMax * 0.65)),
    maxEducation: 1,
    maxSkillGroups: Math.min(5, base.maxSkillGroups),
    maxItemsPerSkill: Math.min(8, base.maxItemsPerSkill),
    maxRoles: Math.min(3, base.maxRoles),
    maxBulletsPerRole: Math.min(4, base.maxBulletsPerRole - 1),
    maxProjects: Math.min(3, base.maxProjects),
    maxBulletsPerProject: Math.min(3, base.maxBulletsPerProject),
  };
}

/** Keeps exports within ~1–2 pages by capping section sizes per template. */
export function trimResumeForTemplate(
  data: ResumeData,
  template: LatexTemplateId,
  preferOnePage?: boolean,
): ResumeData {
  const L = effectiveLimits(template, preferOnePage);

  return {
    ...data,
    summary: truncate(data.summary, L.summaryMax),
    education: data.education.slice(0, L.maxEducation).map((e) => ({
      ...e,
      details: truncate(e.details, 120),
    })),
    skills: data.skills.slice(0, L.maxSkillGroups).map((g) => ({
      category: g.category,
      items: g.items.slice(0, L.maxItemsPerSkill),
    })),
    jobFit: [],
    experience: data.experience.slice(0, L.maxRoles).map((job) => ({
      ...job,
      bullets: job.bullets.slice(0, L.maxBulletsPerRole),
    })),
    projects: data.projects.slice(0, L.maxProjects).map((p) => ({
      ...p,
      bullets: p.bullets.slice(0, L.maxBulletsPerProject),
    })),
  };
}
