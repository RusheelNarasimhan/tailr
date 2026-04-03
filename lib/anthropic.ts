import Anthropic from "@anthropic-ai/sdk";

export const TAILOR_SYSTEM_PROMPT =
  "You are an expert resume writer and ATS optimization specialist. Rewrite the provided resume bullet points to match the job description. Rules: preserve the same number of bullets, never fabricate experience, mirror keywords and phrasing from the job description, use strong action verbs, keep quantifiable metrics if they exist, keep each bullet to 1-2 lines, output ONLY the rewritten bullets one per line each starting with a bullet character, no explanation or intro text.";

export const STRUCTURED_RESUME_SYSTEM_PROMPT = `You output ONLY valid JSON (no markdown fences, no LaTeX, no commentary before or after the JSON).

The JSON must match this shape exactly:
{
  "header": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "" },
  "summary": "",
  "skills": { "languages": [], "tools": [], "concepts": [] },
  "experience": [ { "title": "", "bullets": [] } ]
}

Rules:
- Plain text only in strings — no LaTeX, no HTML, no markdown formatting symbols.
- ATS-friendly, concise language tailored to the job description.
- Rewrite resume content to align with jobDescription; never fabricate experience or employers.
- Every key listed above must be present. Use "" or [] when unknown.
- skills.languages, skills.tools, skills.concepts: short phrases or single words per array item.
- experience: group bullets under realistic titles (e.g. role or "Professional Experience"). Each bullet is one string in bullets[].

The user message is a single JSON object with: jobDescription (string), resumeBullets (string[]), optionalHeader (object with optional name, email, phone, location, linkedin strings).`;

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

export async function fetchStructuredResumeRawText(
  input: StructuredResumeInput,
): Promise<string> {
  const anthropic = getAnthropicClient();
  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: STRUCTURED_RESUME_SYSTEM_PROMPT,
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
