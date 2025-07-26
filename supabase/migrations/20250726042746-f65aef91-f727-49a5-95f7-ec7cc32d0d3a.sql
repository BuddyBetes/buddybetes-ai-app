-- Update subscription_tiers table to support Stripe product IDs and change Founders Access to monthly
ALTER TABLE public.subscription_tiers 
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN stripe_price_id_discounted TEXT;

-- Update the Founders Access tier to be monthly at ₱299
UPDATE public.subscription_tiers 
SET 
  price = 299,
  duration_days = 30,
  stripe_price_id = 'price_1RozY3IM1Ur4QVEvJ9atTJ4e',
  stripe_price_id_discounted = 'price_1RozfTIM1Ur4QVEv4fWjlIan'
WHERE name = 'Founders Access';