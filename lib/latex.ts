import {
  escapeLatex,
  joinLatexParts,
  repairLatexArtifacts,
} from "@/lib/latex/escape";
import { validateLatexDocument } from "@/lib/latex/validate";
import type { LatexTemplateId, ResumeData } from "@/types/resume";

export { escapeLatex, repairLatexArtifacts, validateLatexDocument };

const ACCENT_HTML = "2B6CB0";

function githubHref(raw: string): { url: string; label: string } | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) {
    const label = t.replace(/^https?:\/\/(www\.)?/i, "");
    return { url: t, label };
  }
  const path = t.replace(/^github\.com\/?/i, "").replace(/^\//, "");
  return {
    url: `https://github.com/${path}`,
    label: `github.com/${path}`,
  };
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
    parts.push(
      `\\href{${escapeLatex(gh.url)}}{\\color{accent}${escapeLatex(gh.label)}}`,
    );
  }
  return joinLatexParts(parts, "\\textbullet{}");
}

const TEMPLATE_PREAMBLE: Record<
  LatexTemplateId,
  { geometry: string; bodySize: string; extras: string[] }
> = {
  compact: {
    geometry: "\\usepackage[margin=0.45in]{geometry}",
    bodySize: "\\small",
    extras: [
      "\\setlength{\\parskip}{0.15em}",
      "\\titleformat{\\section}{\\color{accent}\\normalsize\\bfseries}{}{0em}{}[\\color{accent}\\titlerule]",
      "\\titlespacing*{\\section}{0pt}{0.5ex}{0.2ex}",
    ],
  },
  modern: {
    geometry: "\\usepackage[margin=0.65in]{geometry}",
    bodySize: "",
    extras: [
      "\\titleformat{\\section}{\\color{accent}\\large\\bfseries}{}{0em}{}[\\color{accent}\\titlerule]",
      "\\titlespacing*{\\section}{0pt}{1ex}{0.5ex}",
    ],
  },
  academic: {
    geometry: "\\usepackage[margin=0.75in]{geometry}",
    bodySize: "",
    extras: [
      "\\titleformat{\\section}{\\color{accent}\\bfseries\\scshape}{}{0em}{}",
      "\\titlespacing*{\\section}{0pt}{1.2ex}{0.4ex}",
    ],
  },
};

function sectionTitle(template: LatexTemplateId, name: string): string {
  const upper = name.toUpperCase();
  if (template === "academic") {
    return `\\section*{${escapeLatex(name)}}`;
  }
  return `\\section*{${escapeLatex(upper)}}`;
}

function renderSkills(data: ResumeData): string {
  if (!data.skills.length) return "";
  return data.skills
    .filter((g) => g.items.length > 0)
    .map(
      (g) =>
        `\\noindent\\textbf{${escapeLatex(g.category)}:} ${g.items.map(escapeLatex).join(", ")}\n`,
    )
    .join("\n");
}

function renderEducation(data: ResumeData, template: LatexTemplateId): string {
  if (!data.education.length) return "";
  const tight = template === "compact" ? "\\vspace{-0.15em}" : "";
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
          block += ` \\hfill \\textcolor{accent}{\\textit{Graduated: ${grad}}}`;
        }
        block += `\\\\\n`;
      }
      if (school) {
        block += `{\\textit{${school}}}${tight}\\\\\n`;
      }
      if (details) {
        block += `{\\small ${details}}\\\\\n`;
      }
      block += "\\vspace{0.35em}\n";
      return block;
    })
    .join("\n");
}

function renderJobFit(data: ResumeData): string {
  if (!data.jobFit.length) return "";
  let tex = "\\begin{itemize}[leftmargin=*,nosep,topsep=2pt,itemsep=3pt]\n";
  for (const item of data.jobFit) {
    const req = escapeLatex(item.requirement);
    const res = escapeLatex(item.response);
    tex += `\\item \\textbf{${req || "Requirement"}:} ${res}\n`;
  }
  tex += "\\end{itemize}\n";
  return tex;
}

function renderExperience(
  data: ResumeData,
  template: LatexTemplateId,
): string {
  let expTex = "";
  const itemsep = template === "compact" ? "itemsep=1pt" : "itemsep=2pt";
  const topsep = template === "compact" ? "topsep=1pt" : "topsep=2pt";

  for (const job of data.experience) {
    const title = escapeLatex(job.title.trim());
    const company = escapeLatex(job.company.trim());
    const dates = escapeLatex(job.dates.trim());
    if (!title && !company && job.bullets.length === 0) continue;

    if (title || company || dates) {
      const left = title || escapeLatex("Role");
      const right = joinLatexParts(
        [company, dates].filter(Boolean),
        "\\textbar{}",
      );
      expTex += `\\noindent\\textbf{${left}}`;
      if (right) {
        expTex += ` \\hfill \\textit{${right}}`;
      }
      expTex += `\\\\[0.15em]\n`;
    }

    if (job.bullets.length > 0) {
      expTex += `\\begin{itemize}[leftmargin=*,nosep,${topsep},${itemsep}]\n`;
      for (const b of job.bullets) {
        expTex += `\\item ${escapeLatex(b.text)}\n`;
      }
      expTex += "\\end{itemize}\n\\vspace{0.4em}\n";
    }
  }
  return expTex;
}

export function generateLatexResume(
  data: ResumeData,
  template: LatexTemplateId = "modern",
): string {
  const t = TEMPLATE_PREAMBLE[template];
  const name = escapeLatex(data.header.name) || "Candidate";
  const contact = contactLine(data);
  const summary = escapeLatex(data.summary);
  const skillsTex = renderSkills(data);
  const eduTex = renderEducation(data, template);
  const jobFitTex = renderJobFit(data);
  const expTex = renderExperience(data, template);

  const nameSize = template === "compact" ? "\\Large" : "\\LARGE";
  const headerSkip = template === "compact" ? "0.2em" : "0.35em";
  const afterHeader = template === "compact" ? "0.3em" : "0.6em";

  const blocks: string[] = [];

  blocks.push(
    "\\documentclass[11pt]{article}",
    t.geometry,
    "\\usepackage[dvipsnames]{xcolor}",
    `\\definecolor{accent}{HTML}{${ACCENT_HTML}}`,
    "\\usepackage{enumitem}",
    "\\usepackage{titlesec}",
    "\\usepackage[hidelinks]{hyperref}",
    ...t.extras,
    "\\pagestyle{empty}",
    "\\begin{document}",
    t.bodySize,
    "\\begin{center}",
    `{${nameSize}\\bfseries\\color{accent} ${name}}\\\\[${headerSkip}]`,
    `{\\small ${contact}}`,
    "\\end{center}",
    `\\vspace{${afterHeader}}`,
  );

  if (summary) {
    blocks.push(sectionTitle(template, "Summary"), summary, "");
  }

  if (eduTex) {
    blocks.push(sectionTitle(template, "Education"), eduTex);
  }

  if (skillsTex) {
    blocks.push(sectionTitle(template, "Skills"), skillsTex);
  }

  if (jobFitTex) {
    blocks.push(sectionTitle(template, "Role fit"), jobFitTex);
  }

  blocks.push(
    sectionTitle(template, "Experience"),
    expTex.trim() || "\\textit{(No experience listed.)}",
    "\\end{document}",
  );

  const raw = blocks.join("\n");
  const { repaired, valid, issues } = validateLatexDocument(raw);
  if (!valid && process.env.NODE_ENV === "development") {
    console.warn("[latex] validation issues:", issues);
  }
  return repaired;
}
