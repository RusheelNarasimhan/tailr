import crypto from "crypto";
import type { LatexTemplateId } from "@/types/resume";
import { getServiceSupabase } from "@/lib/supabase/admin";

export type CachedTailorPayload = Record<string, unknown>;

export function tailorInputHash(
  jobDescription: string,
  resumeBullets: string[],
  template: LatexTemplateId,
): string {
  const normalized = JSON.stringify({
    jobDescription: jobDescription.trim(),
    resumeBullets: resumeBullets.map((b) => b.trim()).filter(Boolean),
    template,
  });
  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
}

export async function getCachedTailor(
  cacheKey: string,
): Promise<CachedTailorPayload | null> {
  const admin = getServiceSupabase();
  if (!admin) return null;

  const { data, error } = await admin
    .from("resume_generation_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error || !data?.payload) return null;
  return data.payload as CachedTailorPayload;
}

export async function setCachedTailor(
  cacheKey: string,
  payload: CachedTailorPayload,
): Promise<void> {
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
