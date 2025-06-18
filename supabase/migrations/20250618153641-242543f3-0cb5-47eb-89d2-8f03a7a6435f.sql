
-- Update the backfill function to start from June 1, 2025 and include all health data
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
  DELETE FROM public.user_activity_logs WHERE 1=1;
  DELETE FROM public.user_sessions WHERE 1=1;
  DELETE FROM public.user_retention_cohorts WHERE 1=1;
  DELETE FROM public.daily_active_users WHERE 1=1;

  -- Process each glucose log from June 1, 2025 onwards to create sessions and activity
  FOR log_record IN 
    SELECT user_id, created_at, DATE(created_at) as log_date
    FROM public.glucose_logs 
    WHERE DATE(created_at) >= '2025-06-01'
    ORDER BY user_id, created_at
  LOOP
    -- Create a session for this user on this date/time
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

  -- Create retention cohorts based on first health data activity from June 1, 2025 onwards
  INSERT INTO public.user_retention_cohorts (user_id, signup_date, last_activity_date)
  SELECT 
    user_id,
    GREATEST(MIN(DATE(created_at)), DATE('2025-06-01')) as signup_date,
    MAX(DATE(created_at)) as last_activity_date
  FROM public.glucose_logs
  WHERE DATE(created_at) >= '2025-06-01'
  GROUP BY user_id;

  -- Update retention flags based on activity patterns from June 1, 2025 onwards
  UPDATE public.user_retention_cohorts 
  SET 
    day_1_return = EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = user_retention_cohorts.user_id 
      AND DATE(gl.created_at) = signup_date + INTERVAL '1 day'
      AND DATE(gl.created_at) >= '2025-06-01'
    ),
    day_7_return = EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = user_retention_cohorts.user_id 
      AND DATE(gl.created_at) BETWEEN signup_date + INTERVAL '7 days' AND signup_date + INTERVAL '14 days'
      AND DATE(gl.created_at) >= '2025-06-01'
    ),
    day_30_return = EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = user_retention_cohorts.user_id 
      AND DATE(gl.created_at) >= signup_date + INTERVAL '30 days'
      AND DATE(gl.created_at) >= '2025-06-01'
    )
  WHERE user_id IS NOT NULL;

  -- Generate daily active users from historical sessions from June 1, 2025 onwards
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
    WHERE DATE(s.session_start) >= '2025-06-01'
  ) daily_stats
  GROUP BY session_date
  HAVING session_date >= '2025-06-01'
  ORDER BY session_date;

  RAISE NOTICE 'Analytics data backfill completed successfully - processed all health data from June 1, 2025 onwards';
END;
$$;
