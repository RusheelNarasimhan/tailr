export function stripMarkdownFences(text: string): string {
  let s = text.trim();
  const fenced = s.match(/^```(?:latex|tex)?\s*\r?\n([\s\S]*?)\r?\n```$/i);
  if (fenced) return fenced[1].trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:latex|tex)?\s*\r?\n?/i, "");
    s = s.replace(/\r?\n```\s*$/i, "");
  }
  return s.trim();
}
