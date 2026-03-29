import Anthropic from "@anthropic-ai/sdk";

export const TAILOR_SYSTEM_PROMPT =
  'You are an expert resume writer and ATS optimization specialist. Rewrite the provided resume bullet points to match the job description. Rules: preserve the same number of bullets, never fabricate experience, mirror keywords and phrasing from the job description, use strong action verbs, keep quantifiable metrics if they exist, keep each bullet to 1-2 lines, output ONLY the rewritten bullets one per line each starting with a bullet character, no explanation or intro text.';

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }
  return new Anthropic({ apiKey });
}

