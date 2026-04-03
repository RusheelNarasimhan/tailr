import Anthropic from "@anthropic-ai/sdk";

export const TAILOR_SYSTEM_PROMPT =
  "You are an expert resume writer and ATS optimization specialist. Rewrite the provided resume bullet points to match the job description. Rules: preserve the same number of bullets, never fabricate experience, mirror keywords and phrasing from the job description, use strong action verbs, keep quantifiable metrics if they exist, keep each bullet to 1-2 lines, output ONLY the rewritten bullets one per line each starting with a bullet character, no explanation or intro text.";

export const LATEX_RESUME_SYSTEM_PROMPT = `You are generating a clean, professional LaTeX document for PDF export.

Context:
- This will be compiled using a LaTeX API (no errors allowed)
- Must be minimal, modern, and ATS-friendly (for resumes)
- Avoid unnecessary packages
- Ensure it compiles with pdflatex

Rules:
- Always return FULL LaTeX code (no explanations)
- Use standard documentclass (article or moderncv if needed)
- Keep margins tight and professional
- Use consistent formatting (sections, spacing, alignment)
- No comments unless necessary
- Escape special characters properly in all user-supplied text (%, $, _, #, &, ~, ^, {, }, backslash)

Structure:
- Header (name, contact info from JSON when provided)
- Sections with clean formatting
- Bullet points where needed
- No overcomplicated styling
- Rewrite and organize resume content so it aligns with the job description (keywords, tone) without fabricating experience

The user message is a single JSON object (the candidate and job data). Parse it and produce the document.

Output:
Return ONLY valid LaTeX code. Do not wrap in markdown code fences.`;

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }
  return new Anthropic({ apiKey });
}

