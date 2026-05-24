import { polishBulletText } from "@/lib/resume/bullets";
import type { ResumeData } from "@/types/resume";

/** Strip accidental LaTeX/command fragments from model plain-text fields. */
function stripLatexFragments(text: string): string {
  return text
    .replace(/\\textbar\b/gi, " | ")
    .replace(/\\textbackslash\{\}/gi, "")
    .replace(/\{\}textbar\{\}/gi, " | ")
    .replace(/\\[a-zA-Z]+\{?/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeResumeForExport(data: ResumeData): ResumeData {
  return {
    ...data,
    summary: stripLatexFragments(data.summary),
    education: data.education.map((e) => ({
      ...e,
      school: stripLatexFragments(e.school),
      degree: stripLatexFragments(e.degree),
      graduationDate: stripLatexFragments(e.graduationDate),
      details: stripLatexFragments(e.details),
    })),
    skills: data.skills.map((g) => ({
      category: stripLatexFragments(g.category),
      items: g.items.map((i) => stripLatexFragments(i)).filter(Boolean),
    })),
    jobFit: data.jobFit.map((j) => ({
      requirement: stripLatexFragments(j.requirement),
      response: stripLatexFragments(j.response),
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
