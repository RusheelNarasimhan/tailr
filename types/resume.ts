export type ResumeHeader = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
};

export type ResumeSkills = {
  languages: string[];
  tools: string[];
  concepts: string[];
};

export type ResumeExperienceItem = {
  title: string;
  bullets: string[];
};

export type ResumeData = {
  header: ResumeHeader;
  summary: string;
  skills: ResumeSkills;
  experience: ResumeExperienceItem[];
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
      bullets: asStringArray(e.bullets),
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
    data.experience.some((e) => e.title.length > 0 || e.bullets.length > 0);
  if (!hasBody) {
    throw new Error("Resume content is empty after normalization");
  }
}
