import { describe, expect, it } from "vitest";
import { detectJobDomain } from "@/lib/resume/domain";

describe("detectJobDomain", () => {
  it("detects software engineering", () => {
    const jd = `
      Senior Software Engineer — build APIs in TypeScript, own microservices on AWS,
      collaborate with frontend on React. Kubernetes experience preferred.
    `;
    expect(detectJobDomain(jd)).toBe("software_engineering");
  });

  it("detects marketing", () => {
    const jd = `
      Marketing Manager to own SEO, paid social campaigns, brand content, and conversion
      analytics across HubSpot and Google Ads.
    `;
    expect(detectJobDomain(jd)).toBe("marketing");
  });

  it("detects design", () => {
    const jd = `
      Product Designer — lead UX research, Figma prototypes, design systems, and visual
      branding for mobile apps.
    `;
    expect(detectJobDomain(jd)).toBe("design");
  });

  it("falls back to general for very short JD", () => {
    expect(detectJobDomain("Hiring now")).toBe("general");
  });
});
