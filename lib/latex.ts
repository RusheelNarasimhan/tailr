import type { ResumeData } from "@/types/resume";

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

export function generateLatexResume(data: ResumeData): string {
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
    if (title) {
      expTex += `\\textbf{${title}}\\par\\vspace{0.25em}\n`;
    }
    if (job.bullets.length > 0) {
      expTex += "\\begin{itemize}[leftmargin=*,nosep,topsep=2pt,itemsep=2pt]\n";
      for (const b of job.bullets) {
        expTex += `\\item ${escapeLatex(b)}\n`;
      }
      expTex += "\\end{itemize}\n\\vspace{0.6em}\n";
    }
  }

  return [
    "\\documentclass[11pt]{article}",
    "\\usepackage[margin=0.6in]{geometry}",
    "\\usepackage{enumitem}",
    "\\usepackage{titlesec}",
    "\\usepackage[hidelinks]{hyperref}",
    "\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]",
    "\\titlespacing*{\\section}{0pt}{1.2ex}{0.6ex}",
    "\\pagestyle{empty}",
    "\\begin{document}",
    "\\begin{center}",
    `{\\LARGE\\bfseries ${name}}\\\\[0.4em]`,
    `{\\small ${contact}}`,
    "\\end{center}",
    "\\vspace{0.8em}",
    "\\section*{SUMMARY}",
    summary || "\\textit{(No summary.)}",
    "\\section*{SKILLS}",
    skillsTex.trim() || "\\textit{(No skills listed.)}",
    "\\section*{EXPERIENCE}",
    expTex.trim() || "\\textit{(No experience listed.)}",
    "\\end{document}",
  ].join("\n");
}
