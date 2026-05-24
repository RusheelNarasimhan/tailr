import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { ExperienceLevel } from "@/lib/resume/experienceLevel";
import { buildRenderSectionOrder } from "@/lib/resume/renderPlan";
import { sectionTitle, type ResumeSectionId } from "@/lib/resume/sectionOrder";
import type { LatexTemplateId, ResumeData } from "@/types/resume";

const TEXT = "000000";
const LINK = "000000";

const SPACING: Record<
  LatexTemplateId,
  {
    sectionBefore: number;
    sectionAfter: number;
    expBefore: number;
    bulletAfter: number;
    nameAfter: number;
  }
> = {
  compact: {
    sectionBefore: 160,
    sectionAfter: 80,
    expBefore: 80,
    bulletAfter: 40,
    nameAfter: 80,
  },
  modern: {
    sectionBefore: 280,
    sectionAfter: 140,
    expBefore: 120,
    bulletAfter: 60,
    nameAfter: 120,
  },
  academic: {
    sectionBefore: 320,
    sectionAfter: 160,
    expBefore: 140,
    bulletAfter: 50,
    nameAfter: 140,
  },
};

export type GenerateDocxOptions = {
  experienceLevel?: ExperienceLevel;
};

function sectionHeading(
  text: string,
  template: LatexTemplateId,
): Paragraph {
  const s = SPACING[template];
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: TEXT,
        size: template === "compact" ? 22 : 24,
      }),
    ],
    spacing: { before: s.sectionBefore, after: s.sectionAfter },
  });
}

function githubUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.replace(/^github\.com\/?/i, "").replace(/^\//, "");
  return `https://github.com/${path}`;
}

function splitCompanyDates(company: string, dates: string): {
  company: string;
  dates: string;
} {
  const c = company.trim();
  const d = dates.trim();
  if (!d && /\s[–—-]\s/.test(c)) {
    const parts = c.split(/\s[–—-]\s/u);
    if (parts.length >= 2) {
      return {
        company: parts.slice(0, -1).join(" – ").trim(),
        dates: parts[parts.length - 1].trim(),
      };
    }
  }
  return { company: c, dates: d };
}

function titleLine(
  left: string,
  right: string,
  template: LatexTemplateId,
): Paragraph {
  const bodySize = template === "compact" ? 20 : 22;
  const children: TextRun[] = [
    new TextRun({ text: left, bold: true, color: TEXT, size: bodySize }),
  ];
  if (right) {
    children.push(
      new TextRun({ text: "\t", size: bodySize }),
      new TextRun({
        text: right,
        italics: true,
        color: TEXT,
        size: bodySize,
      }),
    );
  }
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children,
    spacing: { before: SPACING[template].expBefore, after: 100 },
  });
}

function bulletParagraph(text: string, template: LatexTemplateId): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: text.trim(), color: TEXT, size: template === "compact" ? 20 : 22 }),
    ],
    bullet: { level: 0 },
    spacing: { after: SPACING[template].bulletAfter },
  });
}

function renderSummary(
  data: ResumeData,
  template: LatexTemplateId,
  heading: string,
): Paragraph[] {
  if (!data.summary.trim()) return [];
  const bodySize = template === "compact" ? 20 : 22;
  return [
    sectionHeading(heading, template),
    new Paragraph({
      children: [
        new TextRun({ text: data.summary.trim(), color: TEXT, size: bodySize }),
      ],
      spacing: { after: SPACING[template].sectionAfter },
    }),
  ];
}

function renderEducation(
  data: ResumeData,
  template: LatexTemplateId,
  heading: string,
): Paragraph[] {
  if (!data.education.length) return [];
  const bodySize = template === "compact" ? 20 : 22;
  const out: Paragraph[] = [sectionHeading(heading, template)];
  for (const e of data.education) {
    const left = e.degree.trim() || "Degree";
    const right = e.graduationDate.trim();
    out.push(titleLine(left, right, template));
    if (e.school.trim()) {
      out.push(
        new Paragraph({
          children: [
            new TextRun({
              text: e.school.trim(),
              italics: true,
              color: TEXT,
              size: bodySize,
            }),
          ],
          spacing: { after: 40 },
        }),
      );
    }
    if (e.details.trim()) {
      out.push(
        new Paragraph({
          children: [
            new TextRun({ text: e.details.trim(), color: TEXT, size: bodySize }),
          ],
          spacing: { after: SPACING[template].sectionAfter },
        }),
      );
    }
  }
  return out;
}

function renderSkills(
  data: ResumeData,
  template: LatexTemplateId,
  heading: string,
): Paragraph[] {
  if (!data.skills.some((g) => g.items.length)) return [];
  const bodySize = template === "compact" ? 20 : 22;
  const out: Paragraph[] = [sectionHeading(heading, template)];
  for (const group of data.skills) {
    if (!group.items.length) continue;
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${group.category}: `,
            bold: true,
            color: TEXT,
            size: bodySize,
          }),
          new TextRun({
            text: group.items.join(", "),
            color: TEXT,
            size: bodySize,
          }),
        ],
        spacing: { after: 80 },
      }),
    );
  }
  return out;
}

function renderExperience(
  data: ResumeData,
  template: LatexTemplateId,
  heading: string,
): Paragraph[] {
  const out: Paragraph[] = [sectionHeading(heading, template)];
  let any = false;
  for (const job of data.experience) {
    if (!job.title.trim() && !job.company.trim() && job.bullets.length === 0) {
      continue;
    }
    any = true;
    const split = splitCompanyDates(job.company, job.dates);
    const left = job.title.trim() || split.company || "Role";
    const right = [split.company && job.title.trim() ? split.company : "", split.dates]
      .filter(Boolean)
      .join(" · ");
    out.push(titleLine(left, right, template));
    for (const b of job.bullets) {
      out.push(bulletParagraph(b.text, template));
    }
  }
  if (!any) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "(No experience listed.)",
            italics: true,
            color: TEXT,
            size: template === "compact" ? 20 : 22,
          }),
        ],
      }),
    );
  }
  return out;
}

function renderProjects(
  data: ResumeData,
  template: LatexTemplateId,
  heading: string,
): Paragraph[] {
  const has = data.projects.some((p) => p.name.trim() || p.bullets.length > 0);
  if (!has) return [];
  const out: Paragraph[] = [sectionHeading(heading, template)];
  for (const proj of data.projects) {
    if (!proj.name.trim() && proj.bullets.length === 0) continue;
    const right = [proj.dates.trim(), proj.stack.trim()].filter(Boolean).join(" · ");
    out.push(titleLine(proj.name.trim() || "Project", right, template));
    for (const b of proj.bullets) {
      out.push(bulletParagraph(b.text, template));
    }
  }
  return out;
}

function renderSection(
  id: ResumeSectionId,
  data: ResumeData,
  template: LatexTemplateId,
  level: ExperienceLevel,
): Paragraph[] {
  const heading = sectionTitle(id, level).toUpperCase();
  switch (id) {
    case "summary":
      return renderSummary(data, template, heading);
    case "education":
      return renderEducation(data, template, heading);
    case "skills":
      return renderSkills(data, template, heading);
    case "experience":
      return renderExperience(data, template, heading);
    case "projects":
      return renderProjects(data, template, heading);
    default:
      return [];
  }
}

export async function generateDocxResume(
  data: ResumeData,
  template: LatexTemplateId = "modern",
  options?: GenerateDocxOptions,
): Promise<Buffer> {
  const level = options?.experienceLevel ?? "experienced_engineer";
  const s = SPACING[template];
  const children: Paragraph[] = [];
  const nameSize = template === "compact" ? 48 : 56;

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.header.name.trim() || "Candidate",
          bold: true,
          color: TEXT,
          size: nameSize,
        }),
      ],
      spacing: { after: s.nameAfter },
    }),
  );

  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  const bits: string[] = [];
  if (data.header.email) bits.push(data.header.email);
  if (data.header.phone) bits.push(data.header.phone);
  if (data.header.location) bits.push(data.header.location);
  if (data.header.linkedin) bits.push(data.header.linkedin);

  if (bits.length) {
    contactRuns.push(
      new TextRun({
        text: bits.join(" · "),
        color: TEXT,
        size: template === "compact" ? 18 : 20,
      }),
    );
  }

  const ghUrl = githubUrl(data.header.github);
  if (ghUrl) {
    if (contactRuns.length) {
      contactRuns.push(
        new TextRun({ text: " · ", color: TEXT, size: template === "compact" ? 18 : 20 }),
      );
    }
    contactRuns.push(
      new ExternalHyperlink({
        link: ghUrl,
        children: [
          new TextRun({
            text: ghUrl.replace(/^https?:\/\/(www\.)?/i, ""),
            color: LINK,
            underline: {},
            size: template === "compact" ? 18 : 20,
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: contactRuns.length
        ? contactRuns
        : [new TextRun({ text: " ", size: 20 })],
      spacing: { after: s.sectionBefore },
    }),
  );

  const order = buildRenderSectionOrder(data, level);
  for (const sectionId of order) {
    children.push(...renderSection(sectionId, data, template, level));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
