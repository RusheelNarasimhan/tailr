import { getServiceSupabase } from "@/lib/supabase/admin";
import { syncProfileFromSubscription } from "@/lib/stripeProfile";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export type ProfileBillingRow = {
  is_pro: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export async function resolveStripeCustomerId(
  stripe: Stripe,
  userId: string,
  email: string | null | undefined,
  profile: ProfileBillingRow,
): Promise<{ customerId: string | null; subscription: Stripe.Subscription | null }> {
  if (profile.stripe_customer_id?.trim()) {
    return { customerId: profile.stripe_customer_id.trim(), subscription: null };
  }

  if (profile.stripe_subscription_id?.trim()) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id.trim(),
      );
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      return { customerId, subscription };
    } catch {
      /* fall through */
    }
  }

  try {
    const found = await stripe.subscriptions.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 1,
    });
    const subscription = found.data[0];
    if (subscription) {
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      return { customerId, subscription };
    }
  } catch {
    /* search may be unavailable on some accounts */
  }

  if (email?.trim()) {
    const customers = await stripe.customers.list({
      email: email.trim(),
      limit: 5,
    });
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 5,
      });
      const match = subs.data.find(
        (s) => s.metadata?.userId === userId || ["active", "trialing"].includes(s.status),
      );
      if (match) {
        return { customerId: customer.id, subscription: match };
      }
      if (customer.id && profile.is_pro) {
        return { customerId: customer.id, subscription: subs.data[0] ?? null };
      }
    }
    if (customers.data[0]?.id) {
      return { customerId: customers.data[0].id, subscription: null };
    }
  }

  return { customerId: null, subscription: null };
}

export async function persistBillingLink(
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription | null,
): Promise<string | null> {
  const admin = getServiceSupabase();
  if (!admin) return "Server cannot persist billing link (missing service role key).";

  if (subscription) {
    const { error } = await syncProfileFromSubscription(admin, userId, subscription);
    return error;
  }

  const { error } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  return error?.message ?? null;
}

export async function ensureBillingCustomer(
  stripe: Stripe,
  userId: string,
  email: string | null | undefined,
  profile: ProfileBillingRow,
): Promise<{ customerId: string | null; error: string | null }> {
  const { customerId, subscription } = await resolveStripeCustomerId(
    stripe,
    userId,
    email,
    profile,
  );

  if (!customerId) {
    return {
      customerId: null,
      error: profile.is_pro
        ? "We could not find your Stripe billing profile. Try subscribing again or contact support."
        : "Subscribe to Pro first.",
    };
  }

  const persistError = await persistBillingLink(userId, customerId, subscription);
  if (persistError) {
    return { customerId, error: persistError };
  }

  return { customerId, error: null };
}
