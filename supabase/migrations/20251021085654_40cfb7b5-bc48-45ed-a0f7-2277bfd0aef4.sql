-- Add retention analytics functions
CREATE OR REPLACE FUNCTION public.get_cohort_retention_data()
RETURNS TABLE(
  cohort_week date,
  signup_count bigint,
  day_1_retention numeric,
  day_7_retention numeric,
  day_30_retention numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    DATE_TRUNC('week', signup_date)::date as cohort_week,
    COUNT(*)::bigint as signup_count,
    ROUND(COUNT(*) FILTER (WHERE day_1_return) * 100.0 / NULLIF(COUNT(*), 0), 2) as day_1_retention,
    ROUND(COUNT(*) FILTER (WHERE day_7_return) * 100.0 / NULLIF(COUNT(*), 0), 2) as day_7_retention,
    ROUND(COUNT(*) FILTER (WHERE day_30_return) * 100.0 / NULLIF(COUNT(*), 0), 2) as day_30_retention
  FROM public.user_retention_cohorts
  WHERE signup_date >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', signup_date)
  ORDER BY cohort_week DESC;
END;
$$;

-- Get user lifecycle distribution
CREATE OR REPLACE FUNCTION public.get_user_lifecycle_distribution()
RETURNS TABLE(
  new_users bigint,
  active_users bigint,
  at_risk_users bigint,
  churned_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE signup_date >= CURRENT_DATE - INTERVAL '7 days')::bigint as new_users,
    COUNT(*) FILTER (WHERE 
      last_activity_date >= CURRENT_DATE - INTERVAL '7 days' 
      AND signup_date < CURRENT_DATE - INTERVAL '7 days'
    )::bigint as active_users,
    COUNT(*) FILTER (WHERE 
      last_activity_date < CURRENT_DATE - INTERVAL '7 days' 
      AND last_activity_date >= CURRENT_DATE - INTERVAL '30 days'
    )::bigint as at_risk_users,
    COUNT(*) FILTER (WHERE 
      last_activity_date < CURRENT_DATE - INTERVAL '30 days' 
      OR last_activity_date IS NULL
    )::bigint as churned_users
  FROM public.user_retention_cohorts;
END;
$$;

-- Create email campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  segment_type TEXT DEFAULT 'all', -- 'all', 'active', 'premium', 'recent'
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email unsubscribes table
CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  reason TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email analytics table
CREATE TABLE IF NOT EXISTS public.email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_log_id UUID REFERENCES public.email_logs(id),
  campaign_id UUID REFERENCES public.email_campaigns(id),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_campaigns
CREATE POLICY "Admins can view all campaigns"
  ON public.email_campaigns FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert campaigns"
  ON public.email_campaigns FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update campaigns"
  ON public.email_campaigns FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete campaigns"
  ON public.email_campaigns FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for email_unsubscribes
CREATE POLICY "Users can view their own unsubscribes"
  ON public.email_unsubscribes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own unsubscribes"
  ON public.email_unsubscribes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_analytics
CREATE POLICY "Admins can view all analytics"
  ON public.email_analytics FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON public.email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON public.email_unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_email_analytics_campaign ON public.email_analytics(campaign_id);