-- Create discount codes table
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  duration_days INTEGER,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discount redemptions table  
CREATE TABLE public.discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id),
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for discount_codes
CREATE POLICY "Anyone can view active discount codes"
ON public.discount_codes
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes
FOR ALL
USING (is_admin(auth.uid()));

-- Policies for discount_redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.discount_redemptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions"
ON public.discount_redemptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
ON public.discount_redemptions
FOR SELECT
USING (is_admin(auth.uid()));

-- Insert the July30Buddybetes code
INSERT INTO public.discount_codes (code, discount_percentage, duration_days, max_uses, expires_at)
VALUES ('July30Buddybetes', 100, 30, 1000, '2025-07-31 23:59:59+00');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_discount_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_discount_codes_updated_at();