/**
 * Escape plain text for LaTeX. Apply only to user/model content, never to LaTeX commands we insert.
 */
/** Normalize plain text before LaTeX escaping (pipes, broken command fragments). */
export function normalizePlainTextForLatex(s: string): string {
  if (!s) return "";
  return s
    .replace(/\\textbar\b/gi, " | ")
    .replace(/\\textbackslash\{\}/gi, "")
    .replace(/\{\}textbar\{\}/gi, " | ")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function escapeLatex(s: string): string {
  if (!s) return "";
  const normalized = normalizePlainTextForLatex(s);
  return normalized
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/%/g, "\\%")
    .replace(/&/g, "\\&")
    .replace(/_/g, "\\_")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    .replace(/\|/g, "{\\cdot}");
}

/** Join already-escaped fragments with a safe separator (not re-escaped). */
export function joinLatexParts(parts: string[], separator = "{\\cdot}"): string {
  return parts.filter(Boolean).join(` ${separator} `);
}

/** Split "Company | 2024" when dates field is empty. */
export function splitCompanyAndDates(
  company: string,
  dates: string,
): { company: string; dates: string } {
  const c = company.trim();
  const d = dates.trim();
  if (d || !c.includes("|")) {
    return { company: c, dates: d };
  }
  const pipe = c.indexOf("|");
  return {
    company: c.slice(0, pipe).trim(),
    dates: c.slice(pipe + 1).trim() || d,
  };
}

/**
 * Fix common double-escape artifacts from older generators (e.g. \\{\\}textbar\\{\\}).
 */
export function repairLatexArtifacts(source: string): string {
  if (!source) return "";
  return source
    .replace(/\\textbackslash\{\}\\{\\}textbar\\{\\}/g, "{\\cdot}")
    .replace(/\\textbackslash\{\}textbar\\textbackslash\{\}/g, "{\\cdot}")
    .replace(/\\textbackslash\{\}\s*textbar/g, "{\\cdot}")
    .replace(/\\{\\}textbar\\{\\}/g, "{\\cdot}")
    .replace(/\{\}textbar\{\}/g, "{\\cdot}")
    .replace(/\\textbar\{\}/g, "{\\cdot}")
    .replace(/\\textbar\b/g, "{\\cdot}");
}
