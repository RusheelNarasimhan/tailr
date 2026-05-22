import Anthropic from "@anthropic-ai/sdk";
import type { OptionalProfileInput } from "@/types/resume";

export const TAILOR_SYSTEM_PROMPT =
  "You are an expert resume writer and ATS optimization specialist. Rewrite the provided resume bullet points to match the job description. Rules: preserve the same number of bullets, never fabricate experience, mirror keywords and phrasing from the job description, use strong action verbs, keep quantifiable metrics if they exist, keep each bullet to 1-2 lines, output ONLY the rewritten bullets one per line each starting with a bullet character, no explanation or intro text.";

export const MULTI_VARIANT_RESUME_SYSTEM_PROMPT = `You output ONLY valid JSON (no markdown fences, no LaTeX, no commentary).

The JSON shape is EXACTLY:
{
  "keywords": {
    "skills": [],
    "tools": [],
    "actionVerbs": []
  },
  "variants": [
    {
      "label": "short label for this angle e.g. Technical leadership",
      "resume": {
        "header": {
          "name": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "github": ""
        },
        "summary": "",
        "education": [
          {
            "school": "",
            "degree": "",
            "graduationDate": "May 2026",
            "details": "GPA, honors, relevant coursework — optional, one line max"
          }
        ],
        "skills": [
          { "category": "Languages", "items": ["TypeScript", "Python"] },
          { "category": "Frameworks & Tools", "items": ["React", "Next.js"] }
        ],
        "jobFit": [
          {
            "requirement": "What the posting asks for (quote or paraphrase)",
            "response": "How this candidate meets it — concrete, 1-2 sentences"
          }
        ],
        "experience": [
          {
            "title": "Role title",
            "company": "Employer",
            "dates": "Jan 2024 – Present",
            "bullets": [
              { "text": "Impact with metric — Why: brief rationale tied to the job", "score": 0.9 }
            ]
          }
        ]
      }
    }
  ],
  "quality": {
    "score": 78,
    "feedback": ["specific suggestion", "another"]
  }
}

You MUST return exactly 3 objects inside "variants". Each variant must:
- Emphasize a different strength (depth vs breadth vs leadership vs impact).
- Vary wording and section emphasis while keeping facts consistent.
- Never fabricate employers, dates, schools, graduation dates, or credentials.

Formatting & readability (all variants):
1. Design for easy scanning: short summary (2-3 lines max), clear section order, dense but not cramped — target ONE page when possible, NEVER exceed TWO pages when rendered (compact layout).
2. Maximize space: remove filler words; merge redundant bullets; keep the strongest 3-5 bullets per role (score highest first).
3. education MUST include graduationDate on every entry (e.g. "May 2026", "Expected Dec 2025"). If unknown from input, infer only if the user provided it in optionalProfile; otherwise use "".
4. skills MUST be an array of { category, items } with 3-6 categories. Category names are bold labels in the export (e.g. Languages, Frameworks & Tools, Cloud & DevOps, Soft Skills). Each category: 4-10 concise items, comma-separated in spirit.
5. header.github: full URL (https://github.com/username) when known; mention a clean, organized profile in summary or jobFit if relevant to the role — do not invent repos.
6. jobFit: 3-5 items that directly answer explicit requirements or implicit questions in jobDescription (years of experience, stack, location, clearance, etc.). requirement = what is asked; response = proof from the candidate's real background.
7. Experience bullets MUST explain WHY, not only WHAT. Use this pattern in text: "Strong outcome with metric — Why: one short clause linking approach or decision to what this job needs." Every bullet is { "text", "score" } with score 0.0-1.0 for job relevance; sort descending per role.

Job-specific optimization:
- keywords.skills, keywords.tools, keywords.actionVerbs: 5-15 plain strings each from jobDescription.
- Mirror posting language naturally; ATS-friendly; no keyword stuffing.
- quality.score: integer 0-100 for the strongest variant.
- quality.feedback: 2-5 specific strings (readability, missing graduation date, weak jobFit, GitHub, bold skill groups, 2-page length, etc.).

Rules:
- Plain text only in strings (no HTML, no LaTeX).
- All required keys present; use "" or [] when unknown.
- experience.bullets are ONLY objects with "text" and "score", never raw strings.

The user message JSON contains: jobDescription, resumeBullets (string[]), optionalProfile (optional header + education hints), preferOnePage (boolean). When preferOnePage is true, bias toward a single-page layout: shorter summary, fewer bullets per role, fewer jobFit items.`;

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }
  return new Anthropic({ apiKey });
}

export type StructuredResumeInput = {
  jobDescription: string;
  resumeBullets: string[];
  optionalProfile: OptionalProfileInput;
  preferOnePage?: boolean;
};

export async function fetchMultiVariantResumeRawText(
  input: StructuredResumeInput,
): Promise<string> {
  const anthropic = getAnthropicClient();
  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16384,
    system: MULTI_VARIANT_RESUME_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          jobDescription: input.jobDescription,
          resumeBullets: input.resumeBullets,
          optionalProfile: input.optionalProfile,
          preferOnePage: Boolean(input.preferOnePage),
        }),
      },
    ],
  });

  return completion.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("")
    .trim();
}
