import { polishBulletText } from "@/lib/resume/bullets";

export type LatexTemplateId = "compact" | "modern" | "academic";

export const LATEX_TEMPLATES: { id: LatexTemplateId; label: string }[] = [
  { id: "compact", label: "Compact (2-page max)" },
  { id: "modern", label: "Modern" },
  { id: "academic", label: "Academic" },
];

export function isLatexTemplateId(s: string): s is LatexTemplateId {
  return s === "compact" || s === "modern" || s === "academic";
}

export type ResumeHeader = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
};

export type EducationItem = {
  school: string;
  degree: string;
  graduationDate: string;
  details: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type JobFitItem = {
  requirement: string;
  response: string;
};

export type ScoredBullet = {
  text: string;
  score: number;
};

export type ResumeExperienceItem = {
  title: string;
  company: string;
  dates: string;
  bullets: ScoredBullet[];
};

export type ResumeData = {
  header: ResumeHeader;
  summary: string;
  education: EducationItem[];
  skills: SkillGroup[];
  jobFit: JobFitItem[];
  experience: ResumeExperienceItem[];
};

export type OptionalProfileInput = Partial<ResumeHeader> & {
  school?: string;
  degree?: string;
  graduationDate?: string;
};

export type JobKeywords = {
  skills: string[];
  tools: string[];
  actionVerbs: string[];
};

export type ResumeQuality = {
  score: number;
  feedback: string[];
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asScoredBulletArray(v: unknown): ScoredBullet[] {
  if (!Array.isArray(v)) return [];
  const out: ScoredBullet[] = [];
  for (const item of v) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push({ text: t, score: 0.75 });
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const text = asString(o.text);
      let score = 0.75;
      if (typeof o.score === "number" && !Number.isNaN(o.score)) {
        score = Math.min(1, Math.max(0, o.score));
      }
      if (text) out.push({ text: polishBulletText(text), score });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

function normalizeSkillGroups(skillsRaw: unknown): SkillGroup[] {
  if (!skillsRaw || typeof skillsRaw !== "object") return [];

  if (Array.isArray(skillsRaw)) {
    return skillsRaw
      .filter((g): g is Record<string, unknown> => !!g && typeof g === "object")
      .map((g) => ({
        category: asString(g.category) || "Skills",
        items: asStringArray(g.items),
      }))
      .filter((g) => g.items.length > 0);
  }

  const legacy = skillsRaw as Record<string, unknown>;
  const groups: SkillGroup[] = [];
  const map: [string, string][] = [
    ["Technical", "technical"],
    ["Languages", "languages"],
    ["Frameworks & Tools", "tools"],
    ["Tools", "tools"],
    ["Concepts", "concepts"],
    ["Soft Skills", "softSkills"],
  ];
  const seen = new Set<string>();
  for (const [label, key] of map) {
    const items = asStringArray(legacy[key]);
    if (items.length && !seen.has(label)) {
      seen.add(label);
      groups.push({ category: label, items });
    }
  }
  return groups;
}

function normalizeEducation(raw: unknown): EducationItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((e) => ({
      school: asString(e.school),
      degree: asString(e.degree),
      graduationDate: asString(e.graduationDate ?? e.graduation ?? e.date),
      details: asString(e.details),
    }))
    .filter((e) => e.school || e.degree || e.graduationDate);
}

function normalizeJobFit(raw: unknown): JobFitItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((j): j is Record<string, unknown> => !!j && typeof j === "object")
    .map((j) => ({
      requirement: asString(j.requirement ?? j.question),
      response: asString(j.response ?? j.answer),
    }))
    .filter((j) => j.requirement || j.response)
    .slice(0, 5);
}

export function normalizeResumeData(input: unknown): ResumeData {
  if (!input || typeof input !== "object") {
    throw new Error("Resume data must be an object");
  }
  const o = input as Record<string, unknown>;

  const headerRaw =
    o.header && typeof o.header === "object"
      ? (o.header as Record<string, unknown>)
      : {};

  const experienceRaw = Array.isArray(o.experience) ? o.experience : [];
  const experience: ResumeExperienceItem[] = experienceRaw.map((item) => {
    if (!item || typeof item !== "object") {
      return { title: "", company: "", dates: "", bullets: [] };
    }
    const e = item as Record<string, unknown>;
    return {
      title: asString(e.title),
      company: asString(e.company),
      dates: asString(e.dates),
      bullets: asScoredBulletArray(e.bullets),
    };
  });

  return {
    header: {
      name: asString(headerRaw.name),
      email: asString(headerRaw.email),
      phone: asString(headerRaw.phone),
      location: asString(headerRaw.location),
      linkedin: asString(headerRaw.linkedin),
      github: asString(headerRaw.github),
    },
    summary: asString(o.summary),
    education: normalizeEducation(o.education),
    skills: normalizeSkillGroups(o.skills),
    jobFit: normalizeJobFit(o.jobFit),
    experience,
  };
}

export function mergeOptionalProfile(
  data: ResumeData,
  partial: OptionalProfileInput,
): ResumeData {
  const next = {
    ...data,
    header: {
      name: partial.name?.trim() || data.header.name,
      email: partial.email?.trim() || data.header.email,
      phone: partial.phone?.trim() || data.header.phone,
      location: partial.location?.trim() || data.header.location,
      linkedin: partial.linkedin?.trim() || data.header.linkedin,
      github: partial.github?.trim() || data.header.github,
    },
  };

  const school = partial.school?.trim();
  const degree = partial.degree?.trim();
  const graduationDate = partial.graduationDate?.trim();

  if (school || degree || graduationDate) {
    const existing = [...next.education];
    const first = existing[0] ?? {
      school: "",
      degree: "",
      graduationDate: "",
      details: "",
    };
    existing[0] = {
      school: school || first.school,
      degree: degree || first.degree,
      graduationDate: graduationDate || first.graduationDate,
      details: first.details,
    };
    next.education = existing;
  }

  return next;
}

export function assertResumeDataUsable(data: ResumeData): void {
  const hasBody =
    data.summary.length > 0 ||
    data.education.length > 0 ||
    data.skills.some((g) => g.items.length > 0) ||
    data.jobFit.length > 0 ||
    data.experience.some(
      (e) => e.title.length > 0 || e.bullets.length > 0,
    );
  if (!hasBody) {
    throw new Error("Resume content is empty after normalization");
  }
}

export function normalizeJobKeywords(input: unknown): JobKeywords {
  if (!input || typeof input !== "object") {
    return { skills: [], tools: [], actionVerbs: [] };
  }
  const o = input as Record<string, unknown>;
  return {
    skills: asStringArray(o.skills),
    tools: asStringArray(o.tools),
    actionVerbs: asStringArray(o.actionVerbs ?? o.verbs),
  };
}

export function normalizeQuality(input: unknown): ResumeQuality {
  if (!input || typeof input !== "object") {
    return { score: 0, feedback: [] };
  }
  const o = input as Record<string, unknown>;
  let score = 0;
  if (typeof o.score === "number" && !Number.isNaN(o.score)) {
    const raw = o.score;
    const scaled = raw <= 1 ? raw * 100 : raw;
    score = Math.min(100, Math.max(0, Math.round(scaled)));
  }
  const feedback = asStringArray(o.feedback);
  return { score, feedback: feedback.slice(0, 8) };
}

/** @deprecated use mergeOptionalProfile */
export function mergeOptionalHeader(
  data: ResumeData,
  partial: Partial<ResumeHeader>,
): ResumeData {
  return mergeOptionalProfile(data, partial);
}
