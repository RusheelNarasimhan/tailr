/**
 * Escape plain text for LaTeX. Apply only to user/model content, never to LaTeX commands we insert.
 */

/** Text-mode separator (same as contact line). Do not use \\cdot — it requires math mode. */
export const LATEX_TEXT_SEPARATOR = "\\textbullet{}";

/** Normalize plain text before LaTeX escaping (pipes, broken command fragments). */
export function normalizePlainTextForLatex(s: string): string {
  if (!s) return "";
  return s
    .replace(/\\cdot\b/g, " · ")
    .replace(/\\textbar\b/gi, " · ")
    .replace(/\\textbackslash\{\}/gi, "")
    .replace(/\{\}textbar\{\}/gi, " · ")
    .replace(/\{\s*\\cdot\s*\}/gi, " · ")
    .replace(/\s*\|\s*/g, " · ")
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
    .replace(/>/g, "\\textgreater{}");
}

/** Join already-escaped fragments with a text-mode separator (not re-escaped). */
export function joinLatexParts(
  parts: string[],
  separator: string = LATEX_TEXT_SEPARATOR,
): string {
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
 * Fix common double-escape and math-mode artifacts in generated LaTeX.
 */
export function repairLatexArtifacts(source: string): string {
  if (!source) return "";
  return source
    .replace(/\\textbackslash\{\}\\{\\}textbar\\{\\}/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\\textbackslash\{\}textbar\\textbackslash\{\}/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\\textbackslash\{\}\s*textbar/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\\{\\}textbar\\{\\}/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\{\}textbar\{\}/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\\textbar\{\}/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\\textbar\b/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\{\s*\\cdot\s*\}/g, ` ${LATEX_TEXT_SEPARATOR} `)
    .replace(/\\cdot\b/g, ` ${LATEX_TEXT_SEPARATOR} `);
}
