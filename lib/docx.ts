import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { LatexTemplateId, ResumeData } from "@/types/resume";

const ACCENT = "2B6CB0";

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

function sectionHeading(text: string, template: LatexTemplateId): Paragraph {
  const s = SPACING[template];
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: ACCENT,
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

export async function generateDocxResume(
  data: ResumeData,
  template: LatexTemplateId = "modern",
): Promise<Buffer> {
  const s = SPACING[template];
  const children: Paragraph[] = [];
  const nameSize = template === "compact" ? 48 : 56;
  const bodySize = template === "compact" ? 20 : 22;

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.header.name.trim() || "Candidate",
          bold: true,
          color: ACCENT,
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
        size: template === "compact" ? 18 : 20,
      }),
    );
  }

  const ghUrl = githubUrl(data.header.github);
  if (ghUrl) {
    if (contactRuns.length) {
      contactRuns.push(
        new TextRun({ text: " · ", size: template === "compact" ? 18 : 20 }),
      );
    }
    contactRuns.push(
      new ExternalHyperlink({
        link: ghUrl,
        children: [
          new TextRun({
            text: ghUrl.replace(/^https?:\/\/(www\.)?/i, ""),
            color: ACCENT,
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

  if (data.summary.trim()) {
    children.push(sectionHeading("SUMMARY", template));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.summary.trim(), size: bodySize }),
        ],
        spacing: { after: s.sectionAfter },
      }),
    );
  }

  if (data.education.length) {
    children.push(sectionHeading("EDUCATION", template));
    for (const e of data.education) {
      const line1: TextRun[] = [];
      if (e.degree) {
        line1.push(new TextRun({ text: e.degree, bold: true, size: bodySize }));
      }
      if (e.graduationDate) {
        line1.push(
          new TextRun({ text: "\t", size: bodySize }),
          new TextRun({
            text: `Graduated: ${e.graduationDate}`,
            italics: true,
            color: ACCENT,
            size: bodySize,
          }),
        );
      }
      if (line1.length) {
        children.push(
          new Paragraph({ children: line1, spacing: { after: 60 } }),
        );
      }
      if (e.school) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: e.school, italics: true, size: bodySize }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
      if (e.details) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: e.details, size: bodySize }),
            ],
            spacing: { after: s.sectionAfter },
          }),
        );
      }
    }
  }

  if (data.skills.some((g) => g.items.length)) {
    children.push(sectionHeading("SKILLS", template));
    for (const group of data.skills) {
      if (!group.items.length) continue;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${group.category}: `,
              bold: true,
              size: bodySize,
            }),
            new TextRun({
              text: group.items.join(", "),
              size: bodySize,
            }),
          ],
          spacing: { after: 80 },
        }),
      );
    }
  }

  if (data.jobFit.length) {
    children.push(sectionHeading("ROLE FIT", template));
    for (const item of data.jobFit) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${item.requirement || "Requirement"}: `,
              bold: true,
              size: bodySize,
            }),
            new TextRun({ text: item.response, size: bodySize }),
          ],
          spacing: { after: 100 },
          bullet: { level: 0 },
        }),
      );
    }
  }

  children.push(sectionHeading("EXPERIENCE", template));
  let anyExp = false;
  for (const job of data.experience) {
    if (!job.title.trim() && !job.company.trim() && job.bullets.length === 0)
      continue;
    anyExp = true;
    const headerParts = [job.title.trim(), job.company.trim(), job.dates.trim()]
      .filter(Boolean)
      .join(" · ");
    if (headerParts) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: job.title.trim() || job.company.trim(),
              bold: true,
              size: template === "academic" ? 22 : 24,
            }),
            ...(job.company.trim() || job.dates.trim()
              ? [
                  new TextRun({
                    text: ` — ${[job.company.trim(), job.dates.trim()].filter(Boolean).join(" · ")}`,
                    italics: true,
                    size: bodySize,
                  }),
                ]
              : []),
          ],
          spacing: { before: s.expBefore, after: 100 },
        }),
      );
    }
    for (const bullet of job.bullets) {
      children.push(
        new Paragraph({
          text: bullet.text.trim(),
          bullet: { level: 0 },
          spacing: { after: s.bulletAfter },
        }),
      );
    }
  }
  if (!anyExp) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "(No experience listed.)",
            italics: true,
            size: bodySize,
          }),
        ],
      }),
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
