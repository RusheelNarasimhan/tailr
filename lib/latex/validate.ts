import { repairLatexArtifacts } from "@/lib/latex/escape";

const BROKEN_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /\{\}textbar\{\}/, message: "broken textbar escape" },
  { pattern: /\\textbackslash\{\}textbar/, message: "double-escaped textbar" },
  { pattern: /\\begin\{document\}[\s\S]*\\begin\{document\}/, message: "duplicate document environment" },
  { pattern: /\\end\{document\}[\s\S]*\\end\{document\}/, message: "duplicate end document" },
];

export type LatexValidationResult = {
  valid: boolean;
  issues: string[];
  repaired: string;
};

export function validateLatexDocument(source: string): LatexValidationResult {
  const repaired = repairLatexArtifacts(source);
  const issues: string[] = [];

  if (!repaired.includes("\\begin{document}")) {
    issues.push("missing \\begin{document}");
  }
  if (!repaired.includes("\\end{document}")) {
    issues.push("missing \\end{document}");
  }

  for (const { pattern, message } of BROKEN_PATTERNS) {
    if (pattern.test(repaired)) {
      issues.push(message);
    }
  }

  const openBraces = (repaired.match(/\\{/g) ?? []).length;
  const closeBraces = (repaired.match(/\\}/g) ?? []).length;
  if (Math.abs(openBraces - closeBraces) > 2) {
    issues.push("possible unbalanced escaped braces");
  }

  return {
    valid: issues.length === 0,
    issues,
    repaired,
  };
}
