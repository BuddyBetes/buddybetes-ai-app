
-- Phase 1: Update RLS policies to allow user self-tracking while keeping admin dashboard access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin only access to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admin only access to user_activity_logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admin only access to daily_active_users" ON public.daily_active_users;
DROP POLICY IF EXISTS "Admin only access to user_retention_cohorts" ON public.user_retention_cohorts;

-- Create new policies for user_sessions
CREATE POLICY "Users can insert their own sessions" 
  ON public.user_sessions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.user_sessions 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" 
  ON public.user_sessions 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create new policies for user_activity_logs
CREATE POLICY "Users can insert their own activity logs" 
  ON public.user_activity_logs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity logs" 
  ON public.user_activity_logs 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" 
  ON public.user_activity_logs 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Keep admin-only access for aggregated data tables
CREATE POLICY "Admin only access to daily_active_users" 
  ON public.daily_active_users 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin only access to user_retention_cohorts" 
  ON public.user_retention_cohorts 
  FOR ALL 
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Phase 2: Grant admin access to current user
-- Replace 'your-user-id' with your actual user ID from auth.users
INSERT INTO public.user_roles (user_id, role) 
VALUES ('6e446dc3-ab1e-4b9c-9beb-b955e8bf6b4e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Phase 3: Create historical data migration function
CREATE OR REPLACE FUNCTION public.backfill_analytics_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_record RECORD;
  session_id UUID;
  user_signup_date DATE;
  current_date_iter DATE;
BEGIN
  -- Clear existing analytics data to prevent duplicates
  DELETE FROM public.user_activity_logs;
  DELETE FROM public.user_sessions;
  DELETE FROM public.user_retention_cohorts;
  DELETE FROM public.daily_active_users;

  -- Process each glucose log to create sessions and activity
  FOR log_record IN 
    SELECT DISTINCT user_id, DATE(created_at) as log_date, created_at
    FROM public.glucose_logs 
    ORDER BY user_id, created_at
  LOOP
    -- Create a session for this user on this date
    INSERT INTO public.user_sessions (user_id, session_start, session_end, device_type, browser)
    VALUES (
      log_record.user_id,
      log_record.created_at,
      log_record.created_at + INTERVAL '30 minutes', -- Assume 30 min sessions
      'mobile', -- Most likely mobile usage
      'Chrome'
    )
    RETURNING id INTO session_id;

    -- Create activity log for glucose log entry
    INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
    VALUES (
      log_record.user_id,
      'feature_click',
      'add_glucose_log',
      session_id,
      log_record.created_at
    );

    -- Create page visit activity
    INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
    VALUES (
      log_record.user_id,
      'page_visit',
      '/add-log',
      session_id,
      log_record.created_at - INTERVAL '2 minutes'
    );
  END LOOP;

  -- Create retention cohorts based on first glucose log date
  INSERT INTO public.user_retention_cohorts (user_id, signup_date, last_activity_date)
  SELECT 
    user_id,
    MIN(DATE(created_at)) as signup_date,
    MAX(DATE(created_at)) as last_activity_date
  FROM public.glucose_logs
  GROUP BY user_id;

  -- Update retention flags based on activity patterns
  UPDATE public.user_retention_cohorts 
  SET 
    day_1_return = EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = user_retention_cohorts.user_id 
      AND DATE(gl.created_at) = signup_date + INTERVAL '1 day'
    ),
    day_7_return = EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = user_retention_cohorts.user_id 
      AND DATE(gl.created_at) BETWEEN signup_date + INTERVAL '7 days' AND signup_date + INTERVAL '14 days'
    ),
    day_30_return = EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = user_retention_cohorts.user_id 
      AND DATE(gl.created_at) >= signup_date + INTERVAL '30 days'
    );

  -- Generate daily active users from historical sessions
  INSERT INTO public.daily_active_users (date, total_active_users, new_users, returning_users, total_sessions)
  SELECT 
    session_date,
    COUNT(DISTINCT user_id) as total_active_users,
    COUNT(DISTINCT CASE WHEN is_new_user THEN user_id END) as new_users,
    COUNT(DISTINCT CASE WHEN NOT is_new_user THEN user_id END) as returning_users,
    COUNT(*) as total_sessions
  FROM (
    SELECT 
      DATE(s.session_start) as session_date,
      s.user_id,
      (DATE(s.session_start) = rc.signup_date) as is_new_user
    FROM public.user_sessions s
    JOIN public.user_retention_cohorts rc ON s.user_id = rc.user_id
  ) daily_stats
  GROUP BY session_date
  ORDER BY session_date;

  RAISE NOTICE 'Analytics data backfill completed successfully';
END;
$$;

-- Phase 4: Enhanced analytics function for ongoing updates
CREATE OR REPLACE FUNCTION public.update_daily_active_users_enhanced()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert today's stats
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
