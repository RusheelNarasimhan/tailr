import { getServiceSupabase } from "@/lib/supabase/admin";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  email: string | null;
  is_pro: boolean;
  uses_count: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
};

export const PROFILE_COLUMNS =
  "id,email,is_pro,uses_count,stripe_customer_id,stripe_subscription_id,subscription_status";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<{ profile: UserProfile | null; error: string | null }> {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { profile: null, error: readError.message };
  }

  if (existing) {
    return { profile: existing as UserProfile, error: null };
  }

  const seed = {
    id: user.id,
    email: user.email ?? null,
    is_pro: false,
    uses_count: 0,
  };

  const admin = getServiceSupabase();
  const client = admin ?? supabase;

  const { data: created, error: writeError } = await client
    .from("profiles")
    .upsert(seed, { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (writeError) {
    return { profile: null, error: writeError.message };
  }

  return { profile: created as UserProfile, error: null };
}
