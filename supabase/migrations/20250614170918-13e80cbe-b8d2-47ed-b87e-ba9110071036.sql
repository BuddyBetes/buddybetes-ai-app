
-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('free', 'pending', 'active', 'expired', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('gcash', 'bpi', 'stripe')),
  amount_paid DECIMAL(10,2),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment receipts table
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions NOT NULL,
  receipt_url TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'bpi', 'stripe')),
  reference_number TEXT,
  amount DECIMAL(10,2) NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_tiers (public read access)
CREATE POLICY "Anyone can view active subscription tiers" 
  ON public.subscription_tiers 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for payment_receipts
CREATE POLICY "Users can view their own receipts" 
  ON public.payment_receipts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipts" 
  ON public.payment_receipts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Insert founders tier
INSERT INTO public.subscription_tiers (name, price, duration_days, features) 
VALUES (
  'Founders Access', 
  999.00, 
  365,
  '["ai_insights", "advanced_analytics", "extended_history", "food_analysis", "voice_assistant"]'::jsonb
);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check if user has specific feature access
CREATE OR REPLACE FUNCTION public.has_feature_access(_user_id uuid, _feature text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    JOIN public.subscription_tiers st ON us.tier_id = st.id
    WHERE us.user_id = _user_id
      AND us.status = 'active'
      AND (us.expires_at IS NULL OR us.expires_at > now())
      AND st.features ? _feature
  )
$$;
