import { describe, expect, it } from "vitest";
import {
  detectExperienceLevel,
  shouldIncludeSummary,
} from "@/lib/resume/experienceLevel";

describe("detectExperienceLevel", () => {
  it("detects student new grad from graduation year", () => {
    const level = detectExperienceLevel({
      jobDescription: "Software engineer internship",
      resumeBullets: [
        "Built React dashboard with TypeScript and PostgreSQL",
        "Implemented REST APIs in Node.js",
      ],
      graduationDate: "May 2026",
    });
    expect(level).toBe("student_new_grad");
  });

  it("detects career changer from posting language", () => {
    const level = detectExperienceLevel({
      jobDescription: "Career transition role — pivot into engineering",
      resumeBullets: ["Managed retail team of 12"],
    });
    expect(level).toBe("career_changer");
  });

  it("detects no technical experience for students without stack signals", () => {
    const level = detectExperienceLevel({
      jobDescription: "University student seeking first role",
      resumeBullets: ["Volunteered at campus events", "Customer service associate"],
      graduationDate: "2026",
    });
    expect(level).toBe("no_technical_experience");
  });

  it("defaults to experienced engineer for strong technical bullets", () => {
    const level = detectExperienceLevel({
      jobDescription: "Senior backend engineer",
      resumeBullets: [
        "Reduced API latency 42% with Redis caching in Node.js",
        "Designed PostgreSQL schemas for billing microservice",
        "Deployed services on AWS with Docker and GitHub Actions",
      ],
    });
    expect(level).toBe("experienced_engineer");
  });
});

describe("shouldIncludeSummary", () => {
  it("includes summary for career changers", () => {
    expect(shouldIncludeSummary("career_changer", "engineering")).toBe(true);
  });

  it("skips summary for typical engineers", () => {
    expect(shouldIncludeSummary("experienced_engineer", "engineering")).toBe(
      false,
    );
  });
});
