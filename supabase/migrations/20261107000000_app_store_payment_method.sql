-- Allow App Store (RevenueCat) purchases from the iOS app
ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_payment_method_check;
ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_payment_method_check
CHECK (payment_method IN ('gcash', 'bpi', 'stripe', 'discount_code', 'app_store'));
