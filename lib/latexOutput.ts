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
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model output");
  }

  const slice = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(slice);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`JSON.parse failed: ${msg}`);
  }
}
