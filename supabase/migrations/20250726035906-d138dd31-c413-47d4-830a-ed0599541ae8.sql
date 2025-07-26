-- Update user_subscriptions payment_method constraint to include discount_code
ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_payment_method_check;
ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_payment_method_check 
CHECK (payment_method IN ('gcash', 'bpi', 'stripe', 'discount_code'));

-- Update payment_receipts payment_method constraint to include discount_code
ALTER TABLE public.payment_receipts DROP CONSTRAINT IF EXISTS payment_receipts_payment_method_check;
ALTER TABLE public.payment_receipts ADD CONSTRAINT payment_receipts_payment_method_check 
CHECK (payment_method IN ('gcash', 'bpi', 'stripe', 'discount_code'));