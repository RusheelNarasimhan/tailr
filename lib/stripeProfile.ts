import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

const PRO_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export function isSubscriptionPro(status: Stripe.Subscription.Status): boolean {
  return PRO_STATUSES.has(status);
}

function subscriptionPeriodEndIso(
  subscription: Stripe.Subscription,
): string | null {
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000).toISOString();
  }

  const itemEnds = subscription.items?.data
    .map((item) => item.current_period_end)
    .filter((n): n is number => typeof n === "number");

  if (!itemEnds?.length) return null;

  const end = Math.max(...itemEnds);
  return new Date(end * 1000).toISOString();
}

export async function syncProfileFromSubscription(
  admin: SupabaseClient,
  userId: string,
  subscription: Stripe.Subscription,
): Promise<{ error: string | null }> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const isPro = isSubscriptionPro(subscription.status);

  const { error } = await admin
    .from("profiles")
    .update({
      is_pro: isPro,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_cancel_at_period_end: isPro
        ? Boolean(subscription.cancel_at_period_end)
        : false,
      subscription_period_end: isPro ? subscriptionPeriodEndIso(subscription) : null,
    })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

export async function revokeProBySubscriptionId(
  admin: SupabaseClient,
  subscriptionId: string,
  status: string,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("profiles")
    .update({
      is_pro: false,
      subscription_status: status,
      subscription_cancel_at_period_end: false,
      subscription_period_end: null,
    })
    .eq("stripe_subscription_id", subscriptionId);

  return { error: error?.message ?? null };
}

export function resolveUserIdFromSubscription(
  subscription: Stripe.Subscription,
  sessionUserId?: string | null,
): string | null {
  return (
    subscription.metadata?.userId ??
    sessionUserId ??
    null
  );
}
