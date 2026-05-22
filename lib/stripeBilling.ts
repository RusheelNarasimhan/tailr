import { getServiceSupabase } from "@/lib/supabase/admin";
import { syncProfileFromSubscription } from "@/lib/stripeProfile";
import type Stripe from "stripe";

export type ProfileBillingRow = {
  is_pro: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

function customerIdFrom(
  value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if ("deleted" in value && value.deleted) return null;
  return value.id;
}

async function fromCheckoutSessions(
  stripe: Stripe,
  userId: string,
): Promise<{ customerId: string | null; subscription: Stripe.Subscription | null }> {
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
  });

  const forUser = sessions.data.filter(
    (s) => s.client_reference_id === userId || s.metadata?.userId === userId,
  );

  for (const session of forUser) {
    if (session.status !== "complete") continue;

    let customerId = customerIdFrom(session.customer);

    if (!customerId && session.payment_intent) {
      const piId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id;
      try {
        const pi = await stripe.paymentIntents.retrieve(piId);
        customerId = customerIdFrom(pi.customer);
      } catch {
        /* ignore */
      }
    }

    let subscription: Stripe.Subscription | null = null;
    if (session.subscription) {
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      try {
        subscription = await stripe.subscriptions.retrieve(subId);
        customerId =
          customerId ?? customerIdFrom(subscription.customer);
      } catch {
        /* ignore */
      }
    }

    if (customerId) {
      return { customerId, subscription };
    }
  }

  return { customerId: null, subscription: null };
}

export async function resolveStripeCustomerId(
  stripe: Stripe,
  userId: string,
  email: string | null | undefined,
  profile: ProfileBillingRow,
): Promise<{ customerId: string | null; subscription: Stripe.Subscription | null }> {
  if (profile.stripe_customer_id?.trim()) {
    return { customerId: profile.stripe_customer_id.trim(), subscription: null };
  }

  const fromSessions = await fromCheckoutSessions(stripe, userId);
  if (fromSessions.customerId) {
    return fromSessions;
  }

  if (profile.stripe_subscription_id?.trim()) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id.trim(),
      );
      const customerId = customerIdFrom(subscription.customer);
      if (customerId) return { customerId, subscription };
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
      const customerId = customerIdFrom(subscription.customer);
      if (customerId) return { customerId, subscription };
    }
  } catch {
    /* search optional */
  }

  if (email?.trim()) {
    const customers = await stripe.customers.list({
      email: email.trim(),
      limit: 10,
    });

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });

      const byMeta = subs.data.find((s) => s.metadata?.userId === userId);
      if (byMeta) {
        return { customerId: customer.id, subscription: byMeta };
      }

      const active = subs.data.find((s) =>
        ["active", "trialing"].includes(s.status),
      );
      if (active) {
        return { customerId: customer.id, subscription: active };
      }

      if (profile.is_pro) {
        return { customerId: customer.id, subscription: subs.data[0] ?? null };
      }
    }
  }

  return { customerId: null, subscription: null };
}

export async function createStripeCustomer(
  stripe: Stripe,
  userId: string,
  email: string,
): Promise<string> {
  const customer = await stripe.customers.create({
    email: email.trim(),
    metadata: { userId },
  });
  return customer.id;
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
    .update({
      stripe_customer_id: customerId,
    })
    .eq("id", userId);

  return error?.message ?? null;
}

export async function hasActiveSubscription(
  stripe: Stripe,
  customerId: string,
): Promise<boolean> {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  if (subs.data.length > 0) return true;

  const trialing = await stripe.subscriptions.list({
    customer: customerId,
    status: "trialing",
    limit: 1,
  });
  return trialing.data.length > 0;
}

export async function ensureBillingCustomer(
  stripe: Stripe,
  userId: string,
  email: string | null | undefined,
  profile: ProfileBillingRow,
): Promise<{
  customerId: string | null;
  error: string | null;
  notice: string | null;
}> {
  let { customerId, subscription } = await resolveStripeCustomerId(
    stripe,
    userId,
    email,
    profile,
  );

  let notice: string | null = null;

  if (!customerId && profile.is_pro && email?.trim()) {
    customerId = await createStripeCustomer(stripe, userId, email);
    notice =
      "We created a billing profile for your account. If you have not completed a monthly checkout yet, use Upgrade to start your subscription.";
  }

  if (!customerId) {
    return {
      customerId: null,
      error: profile.is_pro
        ? "No Stripe billing profile is linked. Use Upgrade to subscribe, or contact support."
        : "Subscribe to Pro first.",
      notice: null,
    };
  }

  const persistError = await persistBillingLink(userId, customerId, subscription);
  if (persistError) {
    return { customerId, error: persistError, notice: null };
  }

  if (profile.is_pro && !(await hasActiveSubscription(stripe, customerId))) {
    notice =
      notice ??
      "You have Pro access, but no active monthly subscription was found in Stripe. The portal can update payment details; use Upgrade if you need to start a new subscription.";
  }

  return { customerId, error: null, notice };
}
