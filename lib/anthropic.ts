import Anthropic from "@anthropic-ai/sdk";
import {
  buildMultiVariantSystemPrompt,
  buildTailorUserPayload,
} from "@/lib/resume/prompts";
import type { OptionalProfileInput } from "@/types/resume";

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
  const system = buildMultiVariantSystemPrompt(
    input.jobDescription,
    input.resumeBullets,
    input.optionalProfile.graduationDate,
  );

  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16384,
    system,
    messages: [
      {
        role: "user",
        content: buildTailorUserPayload({
          jobDescription: input.jobDescription,
          resumeBullets: input.resumeBullets,
          optionalProfile: input.optionalProfile as Record<string, unknown>,
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
