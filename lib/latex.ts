import {
  escapeLatex,
  joinLatexParts,
  repairLatexArtifacts,
  splitCompanyAndDates,
} from "@/lib/latex/escape";
import { validateLatexDocument } from "@/lib/latex/validate";
import type { ExperienceLevel } from "@/lib/resume/experienceLevel";
import { sectionTitle, type ResumeSectionId } from "@/lib/resume/sectionOrder";
import { buildRenderSectionOrder } from "@/lib/resume/renderPlan";
import type { LatexTemplateId, ResumeData } from "@/types/resume";

export { escapeLatex, repairLatexArtifacts, validateLatexDocument };

export type GenerateLatexOptions = {
  experienceLevel?: ExperienceLevel;
};

const MARGINS: Record<LatexTemplateId, string> = {
  compact: "\\usepackage[margin=0.5in]{geometry}",
  modern: "\\usepackage[margin=0.6in]{geometry}",
  academic: "\\usepackage[margin=0.65in]{geometry}",
};

function githubHref(raw: string): { url: string; label: string } | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) {
    return { url: t, label: t.replace(/^https?:\/\/(www\.)?/i, "") };
  }
  const path = t.replace(/^github\.com\/?/i, "").replace(/^\//, "");
  return { url: `https://github.com/${path}`, label: `github.com/${path}` };
}

function contactLine(data: ResumeData): string {
  const parts: string[] = [];
  if (data.header.email) parts.push(escapeLatex(data.header.email));
  if (data.header.phone) parts.push(escapeLatex(data.header.phone));
  if (data.header.location) parts.push(escapeLatex(data.header.location));
  if (data.header.linkedin) {
    const li = data.header.linkedin.trim();
    parts.push(
      /^https?:\/\//i.test(li)
        ? `\\href{${escapeLatex(li)}}{${escapeLatex(li.replace(/^https?:\/\/(www\.)?/i, ""))}}`
        : escapeLatex(li),
    );
  }
  const gh = githubHref(data.header.github);
  if (gh) {
    parts.push(`\\href{${escapeLatex(gh.url)}}{${escapeLatex(gh.label)}}`);
  }
  return joinLatexParts(parts);
}

function latexSectionHeading(name: string): string {
  return `\\section*{${escapeLatex(name.toUpperCase())}}`;
}

function renderSkills(data: ResumeData): string {
  if (!data.skills.length) return "";
  return data.skills
    .filter((g) => g.items.length > 0)
    .map(
      (g) =>
        `\\noindent\\textbf{${escapeLatex(g.category)}:} ${g.items.map(escapeLatex).join(", ")}\n\\vspace{0.25em}\n`,
    )
    .join("\n");
}

function renderEducation(data: ResumeData): string {
  if (!data.education.length) return "";
  return data.education
    .map((e) => {
      const degree = escapeLatex(e.degree);
      const school = escapeLatex(e.school);
      const grad = escapeLatex(e.graduationDate);
      const details = escapeLatex(e.details);
      let block = "";
      if (degree || grad) {
        block += `\\noindent\\textbf{${degree || "Degree"}}`;
        if (grad) {
          block += ` \\hfill ${grad}`;
        }
        block += `\\\\\n`;
      }
      if (school) {
        block += `{\\textit{${school}}}\\\\\n`;
      }
      if (details) {
        block += `{\\small ${details}}\\\\\n`;
      }
      block += "\\vspace{0.35em}\n";
      return block;
    })
    .join("\n");
}

function renderBullets(
  bullets: { text: string }[],
  itemsep: string,
  topsep: string,
): string {
  if (!bullets.length) return "";
  let tex = `\\begin{itemize}[leftmargin=*,nosep,${topsep},${itemsep}]\n`;
  for (const b of bullets) {
    tex += `\\item ${escapeLatex(b.text)}\n`;
  }
  tex += "\\end{itemize}\n";
  return tex;
}

function renderExperience(data: ResumeData, template: LatexTemplateId): string {
  const itemsep = template === "compact" ? "itemsep=1pt" : "itemsep=2pt";
  const topsep = template === "compact" ? "topsep=1pt" : "topsep=2pt";
  let tex = "";

  for (const job of data.experience) {
    const split = splitCompanyAndDates(job.company, job.dates);
    const title = escapeLatex(job.title.trim());
    const company = escapeLatex(split.company);
    const dates = escapeLatex(split.dates);
    if (!title && !company && job.bullets.length === 0) continue;

    if (title || company || dates) {
      const left = title || escapeLatex("Role");
      const right = joinLatexParts([company, dates].filter(Boolean));
      tex += `\\noindent\\textbf{${left}}`;
      if (right) {
        tex += ` \\hfill \\textit{${right}}`;
      }
      tex += `\\\\[0.12em]\n`;
    }
    tex += renderBullets(job.bullets, itemsep, topsep);
    tex += "\\vspace{0.35em}\n";
  }
  return tex;
}

function renderProjects(data: ResumeData, template: LatexTemplateId): string {
  const itemsep = template === "compact" ? "itemsep=1pt" : "itemsep=2pt";
  const topsep = template === "compact" ? "topsep=1pt" : "topsep=2pt";
  let tex = "";

  for (const proj of data.projects ?? []) {
    const name = escapeLatex(proj.name.trim());
    const dates = escapeLatex(proj.dates.trim());
    const stack = escapeLatex(proj.stack.trim());
    if (!name && proj.bullets.length === 0) continue;

    const right = joinLatexParts(
      [dates, stack].filter(Boolean),
    );
    tex += `\\noindent\\textbf{${name || "Project"}}`;
    if (right) {
      tex += ` \\hfill \\textit{${right}}`;
    }
    tex += `\\\\[0.12em]\n`;
    tex += renderBullets(proj.bullets, itemsep, topsep);
    tex += "\\vspace{0.35em}\n";
  }
  return tex;
}

function renderSection(
  id: ResumeSectionId,
  data: ResumeData,
  template: LatexTemplateId,
  level: ExperienceLevel,
): string | null {
  switch (id) {
    case "summary":
      if (!data.summary.trim()) return null;
      return `${latexSectionHeading(sectionTitle(id, level))}\n${escapeLatex(data.summary)}\n`;
    case "education": {
      const body = renderEducation(data);
      return body ? `${latexSectionHeading(sectionTitle(id, level))}\n${body}` : null;
    }
    case "skills": {
      const body = renderSkills(data);
      return body ? `${latexSectionHeading(sectionTitle(id, level))}\n${body}` : null;
    }
    case "experience": {
      const body = renderExperience(data, template);
      return `${latexSectionHeading(sectionTitle(id, level))}\n${body.trim() || "\\textit{(No experience listed.)}"}\n`;
    }
    case "projects": {
      const body = renderProjects(data, template);
      if (!body.trim()) return null;
      return `${latexSectionHeading(sectionTitle(id, level))}\n${body}`;
    }
    default:
      return null;
  }
}

export function generateLatexResume(
  data: ResumeData,
  template: LatexTemplateId = "compact",
  options?: GenerateLatexOptions,
): string {
  const level = options?.experienceLevel ?? "experienced_engineer";
  const order = buildRenderSectionOrder(data, level);

  const name = escapeLatex(data.header.name) || "Candidate";
  const contact = contactLine(data);
  const bodySize = template === "compact" ? "\\fontsize{10.5}{12.5}\\selectfont" : "";

  const blocks: string[] = [
    "\\documentclass[11pt]{article}",
    MARGINS[template],
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage{helvet}",
    "\\renewcommand{\\familydefault}{\\sfdefault}",
    "\\usepackage{enumitem}",
    "\\usepackage{titlesec}",
    "\\usepackage[hidelinks]{hyperref}",
    "\\pagestyle{empty}",
    "\\setlength{\\parindent}{0pt}",
    "\\titleformat{\\section}{\\normalsize\\bfseries}{}{0em}{}[\n\\titlerule]",
    "\\titlespacing*{\\section}{0pt}{0.6ex}{0.25ex}",
    "\\begin{document}",
    bodySize,
    "\\begin{center}",
    "{\\Large\\bfseries " + name + "}\\\\[0.25em]",
    "{\\small " + contact + "}",
    "\\end{center}",
    "\\vspace{0.4em}",
  ];

  for (const sectionId of order) {
    const chunk = renderSection(sectionId, data, template, level);
    if (chunk) {
      blocks.push(chunk, "");
    }
  }

  blocks.push("\\end{document}");

  const raw = blocks.join("\n");
  const { repaired, valid, issues } = validateLatexDocument(raw);
  if (!valid && process.env.NODE_ENV === "development") {
    console.warn("[latex] validation issues:", issues);
  }
  return repaired;
}
