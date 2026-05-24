import { describe, expect, it } from "vitest";
import { polishBulletText, sanitizeBulletText } from "@/lib/resume/bullets";

describe("sanitizeBulletText", () => {
  it("removes Why suffixes", () => {
    expect(
      sanitizeBulletText(
        "Increased revenue 20% — Why: aligned pricing with enterprise buyers",
      ),
    ).toBe("Increased revenue 20%");
  });

  it("removes inline Why clauses", () => {
    expect(
      sanitizeBulletText("Built CRM workflow Why: improved pipeline visibility"),
    ).toBe("Built CRM workflow");
  });
});

describe("polishBulletText", () => {
  it("capitalizes and trims robotic openers", () => {
    const out = polishBulletText(
      "successfully launched email nurture program with 12% lift",
    );
    expect(out).toMatch(/^Launched email nurture/);
    expect(out).not.toContain("Why:");
  });

  it("returns empty for blank input", () => {
    expect(polishBulletText("   ")).toBe("");
  });
});
