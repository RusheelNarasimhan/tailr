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

export function stripJsonOrMarkdownFences(text: string): string {
  let s = text.trim();
  const jsonFence = s.match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```$/i);
  if (jsonFence) return jsonFence[1].trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\r?\n?/i, "");
    s = s.replace(/\r?\n```\s*$/i, "");
  }
  return s.trim();
}

export function parseJsonFromModelText(text: string): unknown {
  const cleaned = stripJsonOrMarkdownFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Model output was not valid JSON");
  }
}
