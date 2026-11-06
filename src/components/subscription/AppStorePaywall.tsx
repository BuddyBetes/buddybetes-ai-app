import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Loader2 } from 'lucide-react';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/context/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import {
  APPLE_EULA_URL,
  APPLE_MANAGE_SUBSCRIPTIONS_URL,
  getPremiumPackage,
  purchasePremium,
  restorePremium,
} from '@/lib/purchases';

interface AppStorePaywallProps {
  features: string[];
}

// iOS-only paywall. Apple requires In-App Purchase, a restore option, and
// auto-renewal terms with links to the Terms of Use and Privacy Policy.
const AppStorePaywall: React.FC<AppStorePaywallProps> = ({ features }) => {
  const { subscription, hasActiveSubscription, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);

  useEffect(() => {
    getPremiumPackage()
      .then(setPkg)
      .catch((error) => console.error('Failed to load App Store product:', error))
      .finally(() => setLoadingProduct(false));
  }, []);

  const handlePurchase = async () => {
    if (!pkg) return;
    setBusy('purchase');
    try {
      const completed = await purchasePremium(pkg);
      if (!completed) return;
      await refreshSubscription();
      toast({ title: 'Welcome to Premium!', description: 'All premium features are now unlocked.' });
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({ title: 'Purchase failed', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    setBusy('restore');
    try {
      const restored = await restorePremium();
      await refreshSubscription();
      toast(restored
        ? { title: 'Purchases restored', description: 'Your premium access is active.' }
        : { title: 'No purchases found', description: 'There is no active subscription on this Apple ID.' });
    } catch (error) {
      console.error('Restore failed:', error);
      toast({ title: 'Restore failed', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const product = pkg?.product;

  return (
    <Card className="border-2 border-purple-200 w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
          <Crown className="h-6 w-6 text-purple-500 flex-shrink-0" />
          {product?.title || 'BuddyBetes Premium'}
        </CardTitle>
        {product && (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">{product.priceString}</span>
            <span className="text-base font-normal text-gray-600">/month</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          {hasActiveSubscription ? (
            <>
              <p className="text-center text-green-700 font-medium">Premium is active on your account.</p>
              {subscription?.payment_method === 'app_store' && (
                <Button asChild variant="outline" className="w-full">
                  <a href={APPLE_MANAGE_SUBSCRIPTIONS_URL} target="_blank" rel="noreferrer">
                    Manage subscription
                  </a>
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={!pkg || busy !== null}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg"
            >
              {busy === 'purchase' ? <Loader2 className="h-5 w-5 animate-spin" /> :
               loadingProduct ? 'Loading...' :
               !pkg ? 'Unavailable right now' :
               'Subscribe'}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handleRestore}
            disabled={busy !== null}
            className="w-full text-purple-700"
          >
            {busy === 'restore' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Restore Purchases'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-2">
          <p>
            {product ? `${product.priceString} per month. ` : ''}
            Payment is charged to your Apple ID at confirmation of purchase. The subscription
            renews automatically unless cancelled at least 24 hours before the end of the current
            period. Your account is charged for renewal within 24 hours before the end of the
            current period. Manage or cancel anytime in your Apple ID account settings.
          </p>
          <p className="flex gap-3 justify-center">
            <a href={APPLE_EULA_URL} target="_blank" rel="noreferrer" className="underline">
              Terms of Use (EULA)
            </a>
            <Link to="/terms" className="underline">Terms &amp; Privacy</Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppStorePaywall;
