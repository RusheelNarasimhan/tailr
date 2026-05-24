import { BUZZWORD_BLACKLIST } from "@/lib/resume/philosophy";

const WHY_SUFFIX =
  /\s*[—–-]\s*Why:\s*.+$/i;

const WHY_INLINE = /\s+Why:\s+.+$/i;

const WHY_EM_DASH = /\s*—\s*Why\b[\s\S]*$/i;

const ROBOTIC_PREFIX = /^(?:Successfully\s+)?/i;

const WEAK_OPENERS =
  /^(?:Worked on|Helped|Assisted with|Responsible for|Utilized|Leveraged|Collaborated with|Participated in)\s+/i;

function removeBuzzwords(text: string): string {
  let out = text;
  for (const word of BUZZWORD_BLACKLIST) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    out = out.replace(re, "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/**
 * Strip "Why:" rationale tails and normalize bullets for export.
 */
export function sanitizeBulletText(raw: string): string {
  let text = raw.trim();
  if (!text) return "";

  text = text
    .replace(WHY_SUFFIX, "")
    .replace(WHY_INLINE, "")
    .replace(WHY_EM_DASH, "");
  text = removeBuzzwords(text);
  text = text.replace(/\s{2,}/g, " ").trim();

  if (text.endsWith("—") || text.endsWith("-")) {
    text = text.slice(0, -1).trim();
  }

  return text;
}

export function polishBulletText(raw: string): string {
  const cleaned = sanitizeBulletText(raw);
  if (!cleaned) return "";

  let text = cleaned.replace(ROBOTIC_PREFIX, "");
  text = text.replace(WEAK_OPENERS, "");
  text = text.replace(/^[-•*]\s*/, "");

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (text && !/[.!?]$/.test(text)) {
    text += ".";
  }

  return text;
}
