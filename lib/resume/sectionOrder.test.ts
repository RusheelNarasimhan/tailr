import { describe, expect, it } from "vitest";
import { getSectionOrder, sectionTitle } from "@/lib/resume/sectionOrder";

describe("getSectionOrder", () => {
  it("orders education first for new grads", () => {
    expect(getSectionOrder("student_new_grad")[0]).toBe("education");
    expect(getSectionOrder("student_new_grad")).toContain("projects");
  });

  it("puts projects before experience when no technical background", () => {
    const order = getSectionOrder("no_technical_experience");
    expect(order.indexOf("projects")).toBeLessThan(order.indexOf("experience"));
  });

  it("leads with experience for experienced engineers", () => {
    expect(getSectionOrder("experienced_engineer")[0]).toBe("experience");
  });

  it("starts career changer resumes with summary", () => {
    expect(getSectionOrder("career_changer")[0]).toBe("summary");
  });
});

describe("sectionTitle", () => {
  it("labels experience as relevant for career changers", () => {
    expect(sectionTitle("experience", "career_changer")).toBe(
      "Relevant Experience",
    );
  });
});
