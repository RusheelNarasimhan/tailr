/** Core writing constraints for Tailr resume generation. */

export const RESUME_PHILOSOPHY = `
A Tailr resume is a fast-scanning technical sales document — not a biography.
Optimize for: 30-second skim, ATS parsing, recruiter clarity, human tone, outcomes over fluff.
`;

export const BUZZWORD_BLACKLIST = [
  "leveraged",
  "utilized",
  "spearheaded",
  "orchestrated",
  "innovative",
  "disruptive",
  "cutting-edge",
  "synergy",
  "dynamic",
  "results-driven",
  "team player",
  "hardworking",
  "passionate",
  "rockstar",
  "ninja",
  "guru",
  "world-class",
  "best-in-class",
  "thought leader",
];

export const WEAK_BULLET_PATTERNS = [
  /^worked on\b/i,
  /^helped\b/i,
  /^assisted\b/i,
  /^responsible for\b/i,
  /^utilized\b/i,
  /^leveraged\b/i,
  /^collaborated with\b/i,
  /^participated in\b/i,
  /^involved in\b/i,
];

export const PREFERRED_SKILL_CATEGORIES = [
  "Languages",
  "Frameworks",
  "Tools",
  "Cloud",
  "Databases",
  "Technologies",
] as const;

export const FORBIDDEN_RESUME_SECTIONS = [
  "references",
  "objective",
  "hobbies",
  "interests",
] as const;

export const MAX_BULLET_WORDS = 28;
