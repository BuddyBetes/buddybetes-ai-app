
-- Create table for tracking user sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  device_type TEXT,
  browser TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for logging user activities
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  action_type TEXT NOT NULL, -- 'page_visit', 'feature_click', 'button_click', etc.
  action_target TEXT NOT NULL, -- '/dashboard', 'add_log_button', 'navigation_logs', etc.
  metadata JSONB, -- Additional data about the action
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID REFERENCES public.user_sessions(id)
);

-- Create table for daily aggregated user stats
CREATE TABLE public.daily_active_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_active_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  returning_users INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for retention cohort analysis
CREATE TABLE public.user_retention_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  signup_date DATE NOT NULL,
  day_1_return BOOLEAN DEFAULT false,
  day_7_return BOOLEAN DEFAULT false,
  day_30_return BOOLEAN DEFAULT false,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all analytics tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_active_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_retention_cohorts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only access for analytics)
CREATE POLICY "Admin only access to user_sessions" 
  ON public.user_sessions 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin only access to user_activity_logs" 
  ON public.user_activity_logs 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin only access to daily_active_users" 
  ON public.daily_active_users 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin only access to user_retention_cohorts" 
  ON public.user_retention_cohorts 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Create indexes for better query performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_start_time ON public.user_sessions(session_start);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_timestamp ON public.user_activity_logs(timestamp);
CREATE INDEX idx_user_activity_logs_action_type ON public.user_activity_logs(action_type);
CREATE INDEX idx_daily_active_users_date ON public.daily_active_users(date);
CREATE INDEX idx_user_retention_cohorts_signup_date ON public.user_retention_cohorts(signup_date);

-- Function to update daily active users
CREATE OR REPLACE FUNCTION public.update_daily_active_users()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_active_users (date, total_active_users, new_users, returning_users, total_sessions)
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT s.user_id) as total_active_users,
    COUNT(DISTINCT CASE WHEN rc.signup_date = CURRENT_DATE THEN s.user_id END) as new_users,
    COUNT(DISTINCT CASE WHEN rc.signup_date < CURRENT_DATE THEN s.user_id END) as returning_users,
    COUNT(s.id) as total_sessions
  FROM public.user_sessions s
  LEFT JOIN public.user_retention_cohorts rc ON s.user_id = rc.user_id
  WHERE DATE(s.session_start) = CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_active_users = EXCLUDED.total_active_users,
    new_users = EXCLUDED.new_users,
    returning_users = EXCLUDED.returning_users,
    total_sessions = EXCLUDED.total_sessions,
    updated_at = now();
END;
$$;

-- Function to update retention cohorts
CREATE OR REPLACE FUNCTION public.update_retention_cohorts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new users into cohorts
  INSERT INTO public.user_retention_cohorts (user_id, signup_date, last_activity_date)
  SELECT DISTINCT 
    s.user_id, 
    CURRENT_DATE,
    CURRENT_DATE
  FROM public.user_sessions s
  WHERE DATE(s.session_start) = CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM public.user_retention_cohorts rc 
    WHERE rc.user_id = s.user_id
  );

  -- Update retention flags for existing users
  UPDATE public.user_retention_cohorts 
  SET 
    day_1_return = CASE 
      WHEN signup_date = CURRENT_DATE - INTERVAL '1 day' 
      AND EXISTS (
        SELECT 1 FROM public.user_sessions s 
        WHERE s.user_id = user_retention_cohorts.user_id 
        AND DATE(s.session_start) = CURRENT_DATE
      ) THEN true 
      ELSE day_1_return 
    END,
    day_7_return = CASE 
      WHEN signup_date = CURRENT_DATE - INTERVAL '7 days' 
      AND EXISTS (
        SELECT 1 FROM public.user_sessions s 
        WHERE s.user_id = user_retention_cohorts.user_id 
        AND DATE(s.session_start) = CURRENT_DATE
      ) THEN true 
      ELSE day_7_return 
    END,
    day_30_return = CASE 
      WHEN signup_date = CURRENT_DATE - INTERVAL '30 days' 
      AND EXISTS (
        SELECT 1 FROM public.user_sessions s 
        WHERE s.user_id = user_retention_cohorts.user_id 
        AND DATE(s.session_start) = CURRENT_DATE
      ) THEN true 
      ELSE day_30_return 
    END,
    last_activity_date = CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.user_sessions s 
        WHERE s.user_id = user_retention_cohorts.user_id 
        AND DATE(s.session_start) = CURRENT_DATE
      ) THEN CURRENT_DATE 
      ELSE last_activity_date 
    END,
    updated_at = now()
  WHERE signup_date <= CURRENT_DATE - INTERVAL '1 day';
END;
$$;
