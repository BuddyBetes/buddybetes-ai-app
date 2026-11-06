// Shared RevenueCat helper for App Store (iOS) subscriptions.
// RevenueCat is the source of truth for App Store purchases; this mirrors the
// "premium" entitlement into user_subscriptions so the app keeps a single
// access check across Stripe, GCash, BPI, discount codes and the App Store.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const REVENUECAT_API = "https://api.revenuecat.com/v1";

// Must match the entitlement identifier in the RevenueCat dashboard.
export const PREMIUM_ENTITLEMENT = "premium";

// App Store purchases grant the same tier as the web monthly plan.
const APP_STORE_TIER_NAME = "Buddybetes Monthly";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// RevenueCat app user ids are Supabase user ids (Purchases.logIn), anything
// else is an anonymous RevenueCat id we cannot map to an account.
export const isSupabaseUserId = (id: unknown): id is string =>
  typeof id === "string" && UUID_RE.test(id);

interface Entitlement {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
  purchase_date: string;
}

interface PremiumState {
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
}

async function fetchPremiumState(userId: string): Promise<PremiumState> {
  const apiKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");
  if (!apiKey) throw new Error("REVENUECAT_SECRET_API_KEY is not set");

  const res = await fetch(`${REVENUECAT_API}/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`RevenueCat API ${res.status}: ${await res.text()}`);

  const body = await res.json();
  const entitlement: Entitlement | undefined = body?.subscriber?.entitlements?.[PREMIUM_ENTITLEMENT];
  if (!entitlement) return { active: false, startsAt: null, expiresAt: null };

  // Billing grace period still counts as access
  const expiresAt = entitlement.grace_period_expires_date ?? entitlement.expires_date;
  const active = expiresAt === null || new Date(expiresAt) > new Date();
  return { active, startsAt: entitlement.purchase_date, expiresAt };
}

/**
 * Pulls the user's premium entitlement from RevenueCat and writes it to
 * user_subscriptions. Never overrides an active web/Android purchase that
 * already covers the user for longer.
 */
export async function syncRevenueCatSubscriber(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ active: boolean }> {
  const state = await fetchPremiumState(userId);

  const { data: existing, error: existingError } = await supabase
    .from("user_subscriptions")
    .select("id, status, payment_method, expires_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) throw new Error(`Failed to load subscription: ${existingError.message}`);

  const now = new Date().toISOString();

  if (!state.active) {
    if (existing?.payment_method === "app_store" && existing.status === "active") {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "expired", updated_at: now })
        .eq("id", existing.id);
      if (error) throw new Error(`Failed to expire subscription: ${error.message}`);
    }
    return { active: false };
  }

  const otherStoreCoversLonger =
    existing &&
    existing.payment_method !== "app_store" &&
    existing.status === "active" &&
    state.expiresAt !== null &&
    (existing.expires_at === null || new Date(existing.expires_at) >= new Date(state.expiresAt));
  if (otherStoreCoversLonger) return { active: true };

  const { data: tier, error: tierError } = await supabase
    .from("subscription_tiers")
    .select("id")
    .eq("name", APP_STORE_TIER_NAME)
    .eq("is_active", true)
    .maybeSingle();
  if (tierError || !tier) throw new Error(`Tier "${APP_STORE_TIER_NAME}" not found`);

  const row = {
    user_id: userId,
    tier_id: tier.id,
    status: "active",
    payment_method: "app_store",
    // Apple settles in the buyer's currency, so leave PHP revenue totals untouched
    amount_paid: null,
    starts_at: state.startsAt,
    expires_at: state.expiresAt,
    updated_at: now,
  };

  const { error } = existing
    ? await supabase.from("user_subscriptions").update(row).eq("id", existing.id)
    : await supabase.from("user_subscriptions").insert(row);
  if (error) throw new Error(`Failed to save subscription: ${error.message}`);

  return { active: true };
}
