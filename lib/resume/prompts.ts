import { detectJobDomain, getDomainProfile, type JobDomain } from "@/lib/resume/domain";
import { detectExperienceLevel, shouldIncludeSummary } from "@/lib/resume/experienceLevel";
import { getSectionOrder, sectionTitle } from "@/lib/resume/sectionOrder";
import {
  BUZZWORD_BLACKLIST,
  PREFERRED_SKILL_CATEGORIES,
  RESUME_PHILOSOPHY,
} from "@/lib/resume/philosophy";
import type { ExperienceLevel } from "@/lib/resume/experienceLevel";

const JSON_SCHEMA = `You output ONLY valid JSON (no markdown fences, no LaTeX, no commentary).

The JSON shape is EXACTLY:
{
  "keywords": { "skills": [], "tools": [], "actionVerbs": [] },
  "variants": [
    {
      "label": "short angle label",
      "resume": {
        "header": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" },
        "summary": "",
        "education": [{ "school": "", "degree": "", "graduationDate": "", "details": "" }],
        "skills": [{ "category": "Languages", "items": ["Python"] }],
        "jobFit": [],
        "experience": [{
          "title": "", "company": "", "dates": "Jan 2024 – Present",
          "bullets": [{ "text": "Reduced API latency 42% by adding Redis caching in Node.js services.", "score": 0.95 }]
        }],
        "projects": [{
          "name": "Project Name", "dates": "2024", "stack": "React, Node.js, PostgreSQL",
          "bullets": [{ "text": "Built full-stack app with JWT auth supporting 500+ users.", "score": 0.9 }]
        }]
      }
    }
  ],
  "quality": { "score": 82, "feedback": ["specific improvement"] }
}`;

function philosophyBlock(): string {
  return `
${RESUME_PHILOSOPHY}

WRITING RULES (mandatory):
- Fast-scan technical sales document — readable in under 30 seconds.
- Human, direct, technical tone. No corporate fluff or AI-sounding phrasing.
- Every bullet: strong action verb, ONE sentence, 1–2 lines max, outcome + technical context + metric when possible.
- Structure: Accomplished X by doing Y resulting in Z (or Challenge → Action → Result).
- NEVER use "Why:" or rationale tails in bullets.
- NEVER start with: Worked on, Helped, Utilized, Leveraged, Collaborated with, Responsible for.
- Blacklist (never use): ${BUZZWORD_BLACKLIST.join(", ")}.

BAD bullet: "Worked on backend systems"
GOOD bullet: "Reduced API response times 42% by implementing Redis caching and query optimization across Node.js services"

PROJECTS:
- Extract real projects from resumeBullets (Tailr, AI Dungeon, coursework, etc.) into projects[].
- Projects must show technical decisions, stack, integration, and measurable outcomes — not tutorial apps.
- Put internship/class/contract technical work in experience[]; side apps in projects[] when appropriate.

SKILLS:
- Categories only: ${PREFERRED_SKILL_CATEGORIES.join(", ")} (adapt labels to role).
- Format: Category: item, item, item — NO proficiency bars, NO soft skills, NO keyword dumps.
- Only list skills evidenced in experience/projects.

SECTIONS — never include: References, Objective, hobbies.
- jobFit MUST always be [] (empty array) — do not generate role-fit Q&A blocks.
- summary: empty string unless experienceLevel requires summary (career changer or senior transition).

FORMATTING (export handles layout):
- Single-column, black text, no icons/graphics/tables/multi-column — plain text only.
- One page by default when preferOnePage is true.
`;
}

function levelInstructions(level: ExperienceLevel, domain: JobDomain): string {
  const order = getSectionOrder(level)
    .filter((id) => id !== "summary" || shouldIncludeSummary(level, domain))
    .map((id) => sectionTitle(id))
    .join(" → ");

  return `
EXPERIENCE LEVEL: ${level}
SECTION ORDER for this resume: ${order}
Include summary field: ${shouldIncludeSummary(level, domain) ? "yes (2-3 lines max, role-targeted)" : "no (empty string)"}
`;
}

function domainInstructions(domain: JobDomain): string {
  const profile = getDomainProfile(domain);
  return `
TARGET ROLE DOMAIN: ${profile.label}
Tone: ${profile.tone}
Emphasize: ${profile.emphasis.join("; ")}
Reorder bullets/projects/skills so the most job-relevant items appear first (use score 0.0-1.0).
Variant labels (use closely): "${profile.variantAngles[0]}", "${profile.variantAngles[1]}", "${profile.variantAngles[2]}"
Mirror job posting terminology naturally — no keyword stuffing.
github: only if engineering/data/design role and URL exists in input.
`;
}

export function buildMultiVariantSystemPrompt(
  jobDescription: string,
  resumeBullets: string[],
  graduationDate?: string,
): string {
  const domain = detectJobDomain(jobDescription);
  const level = detectExperienceLevel({
    jobDescription,
    resumeBullets,
    graduationDate,
  });

  return `${JSON_SCHEMA}
${philosophyBlock()}
${levelInstructions(level, domain)}
${domainInstructions(domain)}

Return exactly 3 variants. Facts must stay truthful — never invent employers, dates, schools, or tools not supported by input.
quality.score: 0-100 skim-readability + technical credibility for the target role.
quality.feedback: 2-5 concrete fixes (buzzwords, weak verbs, missing metrics, section order).`;
}

export function buildTailorUserPayload(input: {
  jobDescription: string;
  resumeBullets: string[];
  optionalProfile: Record<string, unknown>;
  preferOnePage?: boolean;
}): string {
  const domain = detectJobDomain(input.jobDescription);
  const level = detectExperienceLevel({
    jobDescription: input.jobDescription,
    resumeBullets: input.resumeBullets,
    graduationDate:
      typeof input.optionalProfile.graduationDate === "string"
        ? input.optionalProfile.graduationDate
        : undefined,
  });

  return JSON.stringify({
    ...input,
    detectedDomain: domain,
    domainLabel: getDomainProfile(domain).label,
    experienceLevel: level,
    sectionOrder: getSectionOrder(level),
    includeSummary: shouldIncludeSummary(level, domain),
  });
}
