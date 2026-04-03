import Anthropic from "@anthropic-ai/sdk";

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
        "header": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "" },
        "summary": "",
        "skills": { "languages": [], "tools": [], "concepts": [] },
        "experience": [ { "title": "", "bullets": [ { "text": "", "score": 0.85 } ] } ]
      }
    }
  ],
  "quality": {
    "score": 78,
    "feedback": ["max 2 sentences each, specific to this resume vs job", "another concrete suggestion"]
  }
}

You MUST return exactly 3 objects inside "variants". Each variant must:
- Emphasize a different strength (e.g. depth vs breadth vs leadership vs impact).
- Vary wording and section emphasis slightly while keeping facts consistent.
- Never fabricate employers, dates, or credentials.

Job-specific optimization (all variants):
1. From jobDescription, infer keywords.skills (domain skills), keywords.tools (software/platforms), keywords.actionVerbs (strong verbs the posting favors). Lists should be short (5–15 items each), plain strings, no stuffing.
2. For every experience bullet: rewrite for natural keyword alignment, stronger impact, metrics where the source implied them; remove weak filler ("responsible for", "helped with" without outcome). ATS-friendly plain English.
3. Each bullet MUST be an object { "text": "...", "score": 0.0-1.0 } where score is relevance to the job (fit + impact). Sort bullets by score descending within each role in your output. Drop or merge only redundant lines; keep the strongest bullets per variant (aim for quality over quantity).

quality.score: integer 0–100 summarizing keyword fit, clarity, and quantified impact for the strongest variant.
quality.feedback: 2–5 short, specific strings referencing this job and these bullets (not generic career advice).

Rules:
- Plain text only in strings.
- All required keys present; use "" or [] when unknown.
- experience.bullets are ONLY objects with "text" and "score", never raw strings.

The user message JSON contains: jobDescription, resumeBullets (string[]), optionalHeader (optional fields).`;

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
  optionalHeader: Partial<{
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  }>;
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
          optionalHeader: input.optionalHeader,
        }),
      },
    ],
  });

  return completion.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("")
    .trim();
}
