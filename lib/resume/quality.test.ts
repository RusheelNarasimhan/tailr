import { describe, expect, it } from "vitest";
import { validateResumeQuality } from "@/lib/resume/quality";
import type { ResumeData } from "@/types/resume";

const base: ResumeData = {
  header: { name: "A", email: "", phone: "", location: "", linkedin: "", github: "" },
  summary: "",
  education: [],
  skills: [],
  jobFit: [],
  experience: [],
  projects: [],
};

describe("validateResumeQuality", () => {
  it("flags buzzwords and weak openers", () => {
    const issues = validateResumeQuality({
      ...base,
      experience: [
        {
          title: "Dev",
          company: "Co",
          dates: "2024",
          bullets: [
            { text: "Leveraged synergies to improve workflows", score: 0.5 },
            { text: "Worked on backend systems for the team", score: 0.5 },
          ],
        },
      ],
    });
    expect(issues.some((i) => i.message.includes("Buzzword"))).toBe(true);
    expect(issues.some((i) => i.message.includes("Weak opener"))).toBe(true);
  });

  it("flags soft-skill categories", () => {
    const issues = validateResumeQuality({
      ...base,
      skills: [{ category: "Soft Skills", items: ["Communication"] }],
    });
    expect(issues.some((i) => i.message.includes("soft-skill"))).toBe(true);
  });
});
