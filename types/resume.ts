export type LatexTemplateId = "compact" | "modern" | "academic";

export const LATEX_TEMPLATES: { id: LatexTemplateId; label: string }[] = [
  { id: "compact", label: "Compact" },
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
};

export type ScoredBullet = {
  text: string;
  score: number;
};

export type ResumeSkills = {
  languages: string[];
  tools: string[];
  concepts: string[];
};

export type ResumeExperienceItem = {
  title: string;
  bullets: ScoredBullet[];
};

export type ResumeData = {
  header: ResumeHeader;
  summary: string;
  skills: ResumeSkills;
  experience: ResumeExperienceItem[];
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
      if (text) out.push({ text, score });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

export function normalizeResumeData(input: unknown): ResumeData {
  if (!input || typeof input !== "object") {
    throw new Error("Resume data must be an object");
  }
  const o = input as Record<string, unknown>;

  const headerRaw = o.header && typeof o.header === "object" ? (o.header as Record<string, unknown>) : {};
  const skillsRaw = o.skills && typeof o.skills === "object" ? (o.skills as Record<string, unknown>) : {};

  const experienceRaw = Array.isArray(o.experience) ? o.experience : [];
  const experience: ResumeExperienceItem[] = experienceRaw.map((item) => {
    if (!item || typeof item !== "object") {
      return { title: "", bullets: [] };
    }
    const e = item as Record<string, unknown>;
    return {
      title: asString(e.title),
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
    },
    summary: asString(o.summary),
    skills: {
      languages: asStringArray(skillsRaw.languages),
      tools: asStringArray(skillsRaw.tools),
      concepts: asStringArray(skillsRaw.concepts),
    },
    experience,
  };
}

export function mergeOptionalHeader(
  data: ResumeData,
  partial: Partial<ResumeHeader>,
): ResumeData {
  return {
    ...data,
    header: {
      name: partial.name?.trim() || data.header.name,
      email: partial.email?.trim() || data.header.email,
      phone: partial.phone?.trim() || data.header.phone,
      location: partial.location?.trim() || data.header.location,
      linkedin: partial.linkedin?.trim() || data.header.linkedin,
    },
  };
}

export function assertResumeDataUsable(data: ResumeData): void {
  const hasBody =
    data.summary.length > 0 ||
    data.skills.languages.length +
      data.skills.tools.length +
      data.skills.concepts.length >
      0 ||
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
