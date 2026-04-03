import type { LatexTemplateId, ResumeData } from "@/types/resume";

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
    .replace(/~/g, "\\textasciitilde{}");
}

function contactLine(data: ResumeData): string {
  const parts: string[] = [];
  if (data.header.email) parts.push(data.header.email);
  if (data.header.phone) parts.push(data.header.phone);
  if (data.header.location) parts.push(data.header.location);
  if (data.header.linkedin) parts.push(escapeLatex(data.header.linkedin.trim()));
  return parts.join(" \\textbullet\\ ");
}

const TEMPLATE_PREAMBLE: Record<
  LatexTemplateId,
  { geometry: string; bodySize: string; extras: string[] }
> = {
  compact: {
    geometry: "\\usepackage[margin=0.45in]{geometry}",
    bodySize: "\\small",
    extras: [
      "\\setlength{\\parskip}{0.25em}",
      "\\titleformat{\\section}{\\normalsize\\bfseries}{}{0em}{}[\\titlerule]",
      "\\titlespacing*{\\section}{0pt}{0.6ex}{0.25ex}",
    ],
  },
  modern: {
    geometry: "\\usepackage[margin=0.65in]{geometry}",
    bodySize: "",
    extras: [
      "\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]",
      "\\titlespacing*{\\section}{0pt}{1.2ex}{0.6ex}",
    ],
  },
  academic: {
    geometry: "\\usepackage[margin=0.75in]{geometry}",
    bodySize: "",
    extras: [
      "\\titleformat{\\section}{\\bfseries\\scshape}{}{0em}{}",
      "\\titlespacing*{\\section}{0pt}{1.4ex}{0.5ex}",
      "\\titleformat{\\subsection}{\\bfseries}{}{0em}{}",
      "\\titlespacing*{\\subsection}{0pt}{0.8ex}{0.3ex}",
    ],
  },
};

export function generateLatexResume(
  data: ResumeData,
  template: LatexTemplateId = "modern",
): string {
  const t = TEMPLATE_PREAMBLE[template];
  const name = escapeLatex(data.header.name) || "Candidate";
  const contact = contactLine(data);
  const summary = escapeLatex(data.summary);

  const skillBlock = (label: string, items: string[]) => {
    if (!items.length) return "";
    return `\\noindent\\textbf{${escapeLatex(label)}:} ${items.map(escapeLatex).join(", ")}\n\n`;
  };

  let skillsTex = "";
  skillsTex += skillBlock("Languages", data.skills.languages);
  skillsTex += skillBlock("Tools", data.skills.tools);
  skillsTex += skillBlock("Concepts", data.skills.concepts);

  let expTex = "";
  for (const job of data.experience) {
    const title = escapeLatex(job.title.trim());
    if (!title && job.bullets.length === 0) continue;

    if (template === "academic" && title) {
      expTex += `\\subsection*{${title}}\n`;
    } else if (title) {
      expTex += `\\textbf{${title}}\\par\\vspace{0.25em}\n`;
    }

    if (job.bullets.length > 0) {
      const itemsep =
        template === "compact" ? "itemsep=1pt" : "itemsep=2pt";
      const topsep = template === "compact" ? "topsep=1pt" : "topsep=2pt";
      expTex += `\\begin{itemize}[leftmargin=*,nosep,${topsep},${itemsep}]\n`;
      for (const b of job.bullets) {
        expTex += `\\item ${escapeLatex(b.text)}\n`;
      }
      expTex += "\\end{itemize}\n\\vspace{0.6em}\n";
    }
  }

  const sectionSummary =
    template === "academic" ? "\\section*{Summary}" : "\\section*{SUMMARY}";
  const sectionSkills =
    template === "academic" ? "\\section*{Skills}" : "\\section*{SKILLS}";
  const sectionExp =
    template === "academic"
      ? "\\section*{Experience}"
      : "\\section*{EXPERIENCE}";

  const nameSize = template === "compact" ? "\\Large" : "\\LARGE";
  const headerSkip = template === "compact" ? "0.25em" : "0.4em";
  const afterHeader = template === "compact" ? "0.4em" : "0.8em";

  const lines = [
    "\\documentclass[11pt]{article}",
    t.geometry,
    "\\usepackage{enumitem}",
    "\\usepackage{titlesec}",
    "\\usepackage[hidelinks]{hyperref}",
    ...t.extras,
    "\\pagestyle{empty}",
    "\\begin{document}",
    t.bodySize,
    "\\begin{center}",
    `{${nameSize}\\bfseries ${name}}\\\\[${headerSkip}]`,
    `{\\small ${contact}}`,
    "\\end{center}",
    `\\vspace{${afterHeader}}`,
    sectionSummary,
    summary || "\\textit{(No summary.)}",
    sectionSkills,
    skillsTex.trim() || "\\textit{(No skills listed.)}",
    sectionExp,
    expTex.trim() || "\\textit{(No experience listed.)}",
    "\\end{document}",
  ];

  return lines.join("\n");
}
