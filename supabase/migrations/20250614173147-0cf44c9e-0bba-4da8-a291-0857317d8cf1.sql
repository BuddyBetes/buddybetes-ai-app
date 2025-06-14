
-- First, remove the NOT NULL constraint from duration_days to allow lifetime subscriptions
ALTER TABLE public.subscription_tiers 
ALTER COLUMN duration_days DROP NOT NULL;

-- Now update Founders Access to be lifetime (null duration_days means lifetime)
UPDATE public.subscription_tiers 
SET duration_days = NULL 
WHERE name = 'Founders Access';
