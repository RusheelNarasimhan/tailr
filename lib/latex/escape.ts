/**
 * Escape plain text for LaTeX. Apply only to user/model content, never to LaTeX commands we insert.
 */
export function escapeLatex(s: string): string {
  if (!s) return "";
  return s
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
    .replace(/\|/g, "\\textbar{}");
}

/** Join already-escaped fragments with a LaTeX separator command (not re-escaped). */
export function joinLatexParts(parts: string[], separatorCommand: string): string {
  return parts.filter(Boolean).join(` ${separatorCommand} `);
}

/**
 * Fix common double-escape artifacts from older generators (e.g. \\{\\}textbar\\{\\}).
 */
export function repairLatexArtifacts(source: string): string {
  if (!source) return "";
  return source
    .replace(/\\{\\}textbar\\{\\}/g, "\\textbar{}")
    .replace(/\\textbackslash\{\}textbar\\textbackslash\{\}/g, "\\textbar{}")
    .replace(/\\textbackslash\{\}\s*textbar/g, "\\textbar{}")
    .replace(/\{\}textbar\{\}/g, "\\textbar{}");
}
