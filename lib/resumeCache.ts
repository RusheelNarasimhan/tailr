import crypto from "crypto";
import type { LatexTemplateId, OptionalProfileInput } from "@/types/resume";

export const CACHE_SCHEMA_VERSION = 4;

export type CachedTailorModelPayload = {
  schemaVersion: number;
  template: LatexTemplateId;
  keywords: {
    skills: string[];
    tools: string[];
    actionVerbs: string[];
  };
  quality: { score: number; feedback: string[] };
  variants: { label: string; resume: unknown }[];
};

function profileForHash(profile?: OptionalProfileInput): Record<string, string> {
  if (!profile) return {};
  const out: Record<string, string> = {};
  const keys = [
    "name",
    "email",
    "phone",
    "location",
    "linkedin",
    "github",
    "school",
    "degree",
    "graduationDate",
  ] as const;
  for (const key of keys) {
    const v = profile[key]?.trim();
    if (v) out[key] = v;
  }
  return out;
}

export function tailorInputHash(
  jobDescription: string,
  resumeBullets: string[],
  template: LatexTemplateId,
  optionalProfile?: OptionalProfileInput,
  preferOnePage?: boolean,
): string {
  const normalized = JSON.stringify({
    schemaVersion: CACHE_SCHEMA_VERSION,
    jobDescription: jobDescription.trim(),
    resumeBullets: resumeBullets.map((b) => b.trim()).filter(Boolean),
    template,
    preferOnePage: Boolean(preferOnePage),
    profile: profileForHash(optionalProfile),
  });
  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
}

export async function getCachedTailor(
  cacheKey: string,
): Promise<CachedTailorModelPayload | null> {
  const { getServiceSupabase } = await import("@/lib/supabase/admin");
  const admin = getServiceSupabase();
  if (!admin) return null;

  const { data, error } = await admin
    .from("resume_generation_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error || !data?.payload) return null;
  const payload = data.payload as Record<string, unknown>;
  if (!isCachedModelPayload(payload)) return null;
  return payload;
}

export async function setCachedTailor(
  cacheKey: string,
  payload: CachedTailorModelPayload,
): Promise<void> {
  const { getServiceSupabase } = await import("@/lib/supabase/admin");
  const admin = getServiceSupabase();
  if (!admin) return;

  await admin.from("resume_generation_cache").upsert(
    {
      cache_key: cacheKey,
      payload,
      created_at: new Date().toISOString(),
    },
    { onConflict: "cache_key" },
  );
}

export function isCachedModelPayload(
  v: Record<string, unknown>,
): v is CachedTailorModelPayload {
  return (
    v.schemaVersion === CACHE_SCHEMA_VERSION &&
    Array.isArray(v.variants) &&
    v.variants.length === 3 &&
    typeof v.template === "string" &&
    v.variants.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { label?: unknown }).label === "string" &&
        (item as { resume?: unknown }).resume !== undefined,
    )
  );
}
