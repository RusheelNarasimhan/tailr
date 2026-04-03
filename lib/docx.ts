import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { ResumeData } from "@/types/resume";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24 })],
    spacing: { before: 280, after: 140 },
  });
}

export async function generateDocxResume(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.header.name.trim() || "Candidate",
          bold: true,
          size: 56,
        }),
      ],
      spacing: { after: 120 },
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
          size: 20,
        }),
      ],
      spacing: { after: 240 },
    }),
  );

  children.push(sectionHeading("SUMMARY"));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.summary.trim() || " ", size: 22 })],
      spacing: { after: 160 },
    }),
  );

  children.push(sectionHeading("SKILLS"));
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
          new TextRun({ text: `${label}: `, bold: true, size: 22 }),
          new TextRun({ text: items.join(", "), size: 22 }),
        ],
        spacing: { after: 100 },
      }),
    );
  }
  if (!anySkill) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "(No skills listed.)", italics: true, size: 22 })],
        spacing: { after: 160 },
      }),
    );
  }

  children.push(sectionHeading("EXPERIENCE"));
  let anyExp = false;
  for (const job of data.experience) {
    if (!job.title.trim() && job.bullets.length === 0) continue;
    anyExp = true;
    if (job.title.trim()) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: job.title.trim(), bold: true, size: 24 })],
          spacing: { before: 120, after: 100 },
        }),
      );
    }
    for (const bullet of job.bullets) {
      children.push(
        new Paragraph({
          text: bullet,
          bullet: { level: 0 },
          spacing: { after: 60 },
        }),
      );
    }
  }
  if (!anyExp) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "(No experience listed.)", italics: true, size: 22 })],
      }),
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
