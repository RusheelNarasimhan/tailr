import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

const PRO_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export function isSubscriptionPro(status: Stripe.Subscription.Status): boolean {
  return PRO_STATUSES.has(status);
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

  const { error } = await admin
    .from("profiles")
    .update({
      is_pro: isSubscriptionPro(subscription.status),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
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
