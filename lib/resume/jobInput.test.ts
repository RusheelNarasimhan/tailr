import { describe, expect, it } from "vitest";
import { validateJobDescription } from "@/lib/resume/jobInput";

describe("validateJobDescription", () => {
  it("rejects empty descriptions", () => {
    const r = validateJobDescription("  ");
    expect(r.valid).toBe(false);
  });

  it("warns on short descriptions but allows", () => {
    const r = validateJobDescription("Looking for a designer.");
    expect(r.valid).toBe(true);
    expect(r.warning).toBeTruthy();
  });

  it("accepts substantial descriptions", () => {
    const r = validateJobDescription(
      "We are hiring a product manager to own roadmap, discovery, and delivery across a cross-functional squad with clear KPIs and stakeholder management expectations for B2B SaaS.",
    );
    expect(r.valid).toBe(true);
    expect(r.warning).toBeNull();
  });
});
