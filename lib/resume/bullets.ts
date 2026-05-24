const WHY_SUFFIX =
  /\s*[—–-]\s*Why:\s*.+$/i;

const WHY_INLINE = /\s+Why:\s+.+$/i;

const ROBOTIC_PREFIX = /^(?:Successfully\s+)?/i;

/**
 * Strip "Why:" rationale tails and normalize bullets for export.
 */
export function sanitizeBulletText(raw: string): string {
  let text = raw.trim();
  if (!text) return "";

  text = text.replace(WHY_SUFFIX, "").replace(WHY_INLINE, "");
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
  text = text.replace(/^[-•*]\s*/, "");

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (text && !/[.!?]$/.test(text)) {
    text += ".";
  }

  return text;
}
