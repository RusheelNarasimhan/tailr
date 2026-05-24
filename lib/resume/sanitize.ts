import { polishBulletText } from "@/lib/resume/bullets";
import type { ResumeData, SkillGroup } from "@/types/resume";

/** Strip accidental LaTeX/command fragments from model plain-text fields. */
function stripLatexFragments(text: string): string {
  return text
    .replace(/\\cdot\b/g, " · ")
    .replace(/\\textbar\b/gi, " · ")
    .replace(/\\textbackslash\{\}/gi, "")
    .replace(/\{\}textbar\{\}/gi, " · ")
    .replace(/\\[a-zA-Z]+\{?/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s*\|\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeSkillCategory(name: string): string {
  const n = name.trim();
  if (/soft skills|leadership|communication|interpersonal/i.test(n)) {
    return "";
  }
  const map: Record<string, string> = {
    technical: "Technologies",
    languages: "Languages",
    frameworks: "Frameworks",
    "frameworks & tools": "Frameworks",
    tools: "Tools",
    "development tools": "Tools",
    cloud: "Cloud",
    "cloud/infrastructure": "Cloud",
    databases: "Databases",
    concepts: "Technologies",
  };
  const key = n.toLowerCase();
  return map[key] ?? n;
}

function filterSkills(groups: SkillGroup[]): SkillGroup[] {
  return groups
    .map((g) => ({
      category: normalizeSkillCategory(g.category),
      items: g.items
        .map((i) => stripLatexFragments(i))
        .filter((i) => !/\b(expert|proficient|familiar|beginner|advanced)\b/i.test(i)),
    }))
    .filter((g) => g.category && g.items.length > 0);
}

export function sanitizeResumeForExport(data: ResumeData): ResumeData {
  return {
    ...data,
    summary: stripLatexFragments(data.summary),
    jobFit: [],
    education: data.education.map((e) => ({
      ...e,
      school: stripLatexFragments(e.school),
      degree: stripLatexFragments(e.degree),
      graduationDate: stripLatexFragments(e.graduationDate),
      details: stripLatexFragments(e.details),
    })),
    skills: filterSkills(data.skills),
    projects: data.projects.map((p) => ({
      name: stripLatexFragments(p.name),
      dates: stripLatexFragments(p.dates),
      stack: stripLatexFragments(p.stack),
      bullets: p.bullets
        .map((b) => ({
          ...b,
          text: polishBulletText(b.text),
        }))
        .filter((b) => b.text.length > 0),
    })),
    experience: data.experience.map((job) => ({
      ...job,
      title: stripLatexFragments(job.title),
      company: stripLatexFragments(job.company),
      dates: stripLatexFragments(job.dates),
      bullets: job.bullets
        .map((b) => ({
          ...b,
          text: polishBulletText(b.text),
        }))
        .filter((b) => b.text.length > 0),
    })),
  };
}
