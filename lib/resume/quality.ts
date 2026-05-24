import {
  BUZZWORD_BLACKLIST,
  MAX_BULLET_WORDS,
  WEAK_BULLET_PATTERNS,
} from "@/lib/resume/philosophy";
import type { ResumeData, ScoredBullet } from "@/types/resume";

export type QualityIssue = {
  severity: "warn" | "error";
  message: string;
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function checkBullet(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lower = text.toLowerCase();

  if (wordCount(text) > MAX_BULLET_WORDS) {
    issues.push({
      severity: "warn",
      message: `Bullet exceeds ${MAX_BULLET_WORDS} words — shorten for skim speed.`,
    });
  }

  for (const weak of WEAK_BULLET_PATTERNS) {
    if (weak.test(text)) {
      issues.push({
        severity: "warn",
        message: `Weak opener detected: "${text.slice(0, 40)}…" — lead with outcome + tech.`,
      });
      break;
    }
  }

  for (const buzz of BUZZWORD_BLACKLIST) {
    if (lower.includes(buzz)) {
      issues.push({
        severity: "warn",
        message: `Buzzword "${buzz}" — use plain technical language.`,
      });
    }
  }

  return issues;
}

function allBullets(data: ResumeData): ScoredBullet[] {
  const fromExp = data.experience.flatMap((e) => e.bullets);
  const fromProj = data.projects.flatMap((p) => p.bullets);
  return [...fromExp, ...fromProj];
}

export function validateResumeQuality(data: ResumeData): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (data.summary.length > 400) {
    issues.push({
      severity: "warn",
      message: "Summary is long — keep to 2–3 lines for scan speed.",
    });
  }

  const bullets = allBullets(data);
  const seen = new Set<string>();

  for (const b of bullets) {
    for (const issue of checkBullet(b.text)) {
      issues.push(issue);
    }
    const key = b.text.toLowerCase().slice(0, 48);
    if (seen.has(key)) {
      issues.push({ severity: "warn", message: "Repeated bullet phrasing detected." });
    }
    seen.add(key);
  }

  for (const group of data.skills) {
    if (/soft skills|leadership|communication/i.test(group.category)) {
      issues.push({
        severity: "warn",
        message: `Remove soft-skill category "${group.category}" — use technical groupings only.`,
      });
    }
    if (/\b(expert|proficient|familiar|beginner)\b/i.test(group.items.join(" "))) {
      issues.push({
        severity: "warn",
        message: "Remove proficiency labels from skills — list technologies only.",
      });
    }
  }

  return issues.slice(0, 12);
}

export function readabilityScore(data: ResumeData): number {
  let score = 100;
  const issues = validateResumeQuality(data);
  score -= issues.filter((i) => i.severity === "error").length * 12;
  score -= issues.filter((i) => i.severity === "warn").length * 4;
  return Math.max(0, Math.min(100, score));
}
