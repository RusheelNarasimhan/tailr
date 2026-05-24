import { describe, expect, it } from "vitest";
import {
  escapeLatex,
  joinLatexParts,
  repairLatexArtifacts,
  splitCompanyAndDates,
} from "@/lib/latex/escape";
import { generateLatexResume } from "@/lib/latex";
import { validateLatexDocument } from "@/lib/latex/validate";
import type { ResumeData } from "@/types/resume";

const baseResume: ResumeData = {
  header: {
    name: "Alex Kim",
    email: "alex@example.com",
    phone: "",
    location: "Toronto",
    linkedin: "",
    github: "",
  },
  summary: "Marketing leader with campaign expertise.",
  education: [],
  skills: [{ category: "Channels", items: ["SEO", "Paid social"] }],
  jobFit: [],
  experience: [
    {
      title: "Marketing Manager",
      company: "Acme Co",
      dates: "2022 – Present",
      bullets: [{ text: "Lifted conversion 18% through A/B tested landing pages.", score: 0.9 }],
    },
  ],
  projects: [],
};

describe("escapeLatex", () => {
  it("escapes special characters", () => {
    expect(escapeLatex("100% & _growth | pipe")).toContain("\\%");
    expect(escapeLatex("100% & _growth | pipe")).toContain("\\&");
    expect(escapeLatex("100% & _growth | pipe")).toContain("\\_");
    expect(escapeLatex("100% & _growth | pipe")).toContain("·");
    expect(escapeLatex("100% & _growth | pipe")).not.toContain("\\cdot");
  });

  it("does not double-escape LaTeX command separators in joinLatexParts", () => {
    const joined = joinLatexParts([escapeLatex("Acme"), escapeLatex("2024")]);
    expect(joined).toBe("Acme \\textbullet{} 2024");
    expect(joined).not.toContain("textbackslash");
    expect(joined).not.toContain("\\cdot");
  });

  it("splits company and dates on pipe", () => {
    expect(splitCompanyAndDates("Tailr Project | 2024", "")).toEqual({
      company: "Tailr Project",
      dates: "2024",
    });
  });
});

describe("repairLatexArtifacts", () => {
  it("fixes broken textbar fragments", () => {
    const broken = "Role \\hfill \\textit{Acme \\{\\}textbar\\{\\} 2024}";
    const fixed = repairLatexArtifacts(broken);
    expect(fixed).not.toContain("{}textbar{}");
    expect(fixed).toContain("\\textbullet{}");
  });

  it("experience line compiles without math-mode cdot in textit", () => {
    const tex = generateLatexResume(
      {
        ...baseResume,
        experience: [
          {
            title: "Digital Marketing Developer",
            company: "Tailr AI Platform",
            dates: "2024",
            bullets: [{ text: "Increased engagement 18%.", score: 0.9 }],
          },
        ],
      },
      "modern",
    );
    expect(tex).toContain("\\textit{Tailr AI Platform \\textbullet{} 2024}");
    expect(tex).not.toMatch(/\{\\cdot\}/);
    expect(tex).not.toMatch(/\\textit\{[^}]*\\cdot/);
  });
});

describe("generateLatexResume / validateLatexDocument", () => {
  it("compiles marketing resume without textbar artifacts", () => {
    const tex = generateLatexResume(baseResume, "compact");
    const { valid, repaired, issues } = validateLatexDocument(tex);
    expect(issues).not.toContain("broken textbar escape");
    expect(repaired).not.toMatch(/\{\}textbar\{\}/);
    expect(valid).toBe(true);
    expect(tex).toContain("\\begin{document}");
  });

  it("handles long company names with special chars", () => {
    const tex = generateLatexResume(
      {
        ...baseResume,
        experience: [
          {
            title: "Lead",
            company: "R&D | Labs (US) & EU",
            dates: "2020–2024",
            bullets: [{ text: "Shipped platform used by 50k users.", score: 1 }],
          },
        ],
      },
      "modern",
    );
    expect(tex).not.toContain("{}textbar{}");
    expect(validateLatexDocument(tex).valid).toBe(true);
  });
});
