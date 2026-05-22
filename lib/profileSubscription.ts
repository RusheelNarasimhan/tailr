import { getServiceSupabase } from "@/lib/supabase/admin";
import {
  PROFILE_COLUMNS,
  type UserProfile,
} from "@/lib/profiles";
import { getStripe } from "@/lib/stripe";
import { syncProfileFromSubscription } from "@/lib/stripeProfile";

export async function refreshProfileSubscriptionFromStripe(
  userId: string,
  profile: UserProfile,
): Promise<UserProfile> {
  const subId = profile.stripe_subscription_id?.trim();
  if (!subId) return profile;

  const admin = getServiceSupabase();
  if (!admin) return profile;

  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subId);
    await syncProfileFromSubscription(admin, userId, subscription);

    const { data } = await admin
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .single();

    return (data as UserProfile) ?? profile;
  } catch {
    return profile;
  }
}

export type ClientProfile = {
  uses_count: number;
  is_pro: boolean;
  subscription_cancel_at_period_end: boolean;
  subscription_period_end: string | null;
};

export function toClientProfile(profile: UserProfile): ClientProfile {
  return {
    uses_count: profile.uses_count,
    is_pro: profile.is_pro,
    subscription_cancel_at_period_end:
      profile.subscription_cancel_at_period_end ?? false,
    subscription_period_end: profile.subscription_period_end ?? null,
  };
}
