import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { LatexTemplateId, ResumeData } from "@/types/resume";

const SPACING: Record<
  LatexTemplateId,
  { sectionBefore: number; sectionAfter: number; expBefore: number; bulletAfter: number; nameAfter: number }
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
    children: [new TextRun({ text, bold: true, size: template === "compact" ? 22 : 24 })],
    spacing: { before: s.sectionBefore, after: s.sectionAfter },
  });
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
          size: nameSize,
        }),
      ],
      spacing: { after: s.nameAfter },
    }),
  );

  const contactBits: string[] = [];
  if (data.header.email) contactBits.push(data.header.email);
  if (data.header.phone) contactBits.push(data.header.phone);
  if (data.header.location) contactBits.push(data.header.location);
  if (data.header.linkedin) contactBits.push(data.header.linkedin);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: contactBits.length ? contactBits.join(" · ") : " ",
          size: template === "compact" ? 18 : 20,
        }),
      ],
      spacing: { after: s.sectionBefore },
    }),
  );

  children.push(sectionHeading("SUMMARY", template));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.summary.trim() || " ", size: bodySize })],
      spacing: { after: s.sectionAfter },
    }),
  );

  children.push(sectionHeading("SKILLS", template));
  const skillRows: [string, string[]][] = [
    ["Languages", data.skills.languages],
    ["Tools", data.skills.tools],
    ["Concepts", data.skills.concepts],
  ];
  let anySkill = false;
  for (const [label, items] of skillRows) {
    if (!items.length) continue;
    anySkill = true;
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: bodySize }),
          new TextRun({ text: items.join(", "), size: bodySize }),
        ],
        spacing: { after: 100 },
      }),
    );
  }
  if (!anySkill) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "(No skills listed.)", italics: true, size: bodySize })],
        spacing: { after: s.sectionAfter },
      }),
    );
  }

  children.push(sectionHeading("EXPERIENCE", template));
  let anyExp = false;
  for (const job of data.experience) {
    if (!job.title.trim() && job.bullets.length === 0) continue;
    anyExp = true;
    if (job.title.trim()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: job.title.trim(),
              bold: true,
              size: template === "academic" ? 22 : 24,
            }),
          ],
          spacing: { before: s.expBefore, after: 100 },
        }),
      );
    }
    for (const bullet of job.bullets) {
      children.push(
        new Paragraph({
          text: bullet.text,
          bullet: { level: 0 },
          spacing: { after: s.bulletAfter },
        }),
      );
    }
  }
  if (!anyExp) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "(No experience listed.)", italics: true, size: bodySize })],
      }),
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
