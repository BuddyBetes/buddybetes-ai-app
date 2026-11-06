import { Capacitor } from '@capacitor/core';
import { Purchases, type PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { supabase } from '@/integrations/supabase/client';

// Must match the entitlement identifier configured in the RevenueCat dashboard.
export const PREMIUM_ENTITLEMENT = 'premium';

export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const APPLE_MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

const IOS_API_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined;

/**
 * Apple requires digital features to be sold through In-App Purchase on iOS,
 * so the iOS app uses RevenueCat while web and Android keep Stripe/GCash/BPI.
 */
export const usesAppStoreBilling = () => Capacitor.getPlatform() === 'ios';

let configured: Promise<void> | null = null;

const ensureConfigured = (): Promise<void> => {
  if (!IOS_API_KEY) {
    return Promise.reject(new Error('VITE_REVENUECAT_IOS_KEY is not set'));
  }
  if (!configured) {
    configured = Purchases.configure({ apiKey: IOS_API_KEY }).catch((error) => {
      configured = null;
      throw error;
    });
  }
  return configured;
};

/**
 * Ties App Store purchases to the Supabase user id so the webhook can map
 * RevenueCat customers back to user_subscriptions rows.
 */
export const identifyPurchaser = async (userId: string | null) => {
  if (!usesAppStoreBilling()) return;
  try {
    await ensureConfigured();
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    } else {
      const { isAnonymous } = await Purchases.isAnonymous();
      if (!isAnonymous) await Purchases.logOut();
    }
  } catch (error) {
    console.error('RevenueCat identify failed:', error);
  }
};

export const getPremiumPackage = async (): Promise<PurchasesPackage | null> => {
  await ensureConfigured();
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  return current?.monthly ?? current?.availablePackages[0] ?? null;
};

const isCancellation = (error: unknown) => {
  const e = error as { userCancelled?: boolean; code?: string | number };
  return e?.userCancelled === true || String(e?.code) === '1';
};

/**
 * Asks the backend to pull the latest entitlement state from RevenueCat and
 * write it to user_subscriptions, so access updates without waiting for the
 * webhook.
 */
const syncWithBackend = async () => {
  const { error } = await supabase.functions.invoke('revenuecat-sync', {});
  if (error) console.error('RevenueCat sync failed:', error);
};

/** Returns false if the user cancelled the App Store sheet. */
export const purchasePremium = async (pkg: PurchasesPackage): Promise<boolean> => {
  await ensureConfigured();
  try {
    await Purchases.purchasePackage({ aPackage: pkg });
  } catch (error) {
    if (isCancellation(error)) return false;
    throw error;
  }
  await syncWithBackend();
  return true;
};

/** Returns whether the restored purchases include an active premium entitlement. */
export const restorePremium = async (): Promise<boolean> => {
  await ensureConfigured();
  const { customerInfo } = await Purchases.restorePurchases();
  await syncWithBackend();
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
};
