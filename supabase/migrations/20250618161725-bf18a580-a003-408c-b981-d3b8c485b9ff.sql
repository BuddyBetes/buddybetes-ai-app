
-- Update the enhanced daily active users function to include AI assistant users
CREATE OR REPLACE FUNCTION public.update_daily_active_users_enhanced()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert today's stats including both health data and AI assistant users
  INSERT INTO public.daily_active_users (date, total_active_users, new_users, returning_users, total_sessions)
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT combined_activity.user_id) as total_active_users,
    COUNT(DISTINCT CASE WHEN rc.signup_date = CURRENT_DATE THEN combined_activity.user_id END) as new_users,
    COUNT(DISTINCT CASE WHEN rc.signup_date < CURRENT_DATE THEN combined_activity.user_id END) as returning_users,
    COUNT(DISTINCT s.id) as total_sessions
  FROM (
    -- Combine users from both glucose logs and assistant conversations for today
    SELECT user_id, created_at FROM public.glucose_logs WHERE DATE(created_at) = CURRENT_DATE
    UNION
    SELECT user_id, created_at FROM public.assistant_conversations WHERE DATE(created_at) = CURRENT_DATE
  ) combined_activity
  LEFT JOIN public.user_retention_cohorts rc ON combined_activity.user_id = rc.user_id
  LEFT JOIN public.user_sessions s ON s.user_id = combined_activity.user_id AND DATE(s.session_start) = CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_active_users = EXCLUDED.total_active_users,
    new_users = EXCLUDED.new_users,
    returning_users = EXCLUDED.returning_users,
    total_sessions = EXCLUDED.total_sessions,
    updated_at = now();
END;
$$;

-- Update the backfill function to include AI assistant conversations
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
    SELECT user_id, created_at, DATE(created_at) as log_date, 'glucose_log' as activity_type
    FROM public.glucose_logs 
    WHERE DATE(created_at) >= '2025-06-01'
    UNION ALL
    SELECT user_id, created_at, DATE(created_at) as log_date, 'assistant_conversation' as activity_type
    FROM public.assistant_conversations 
    WHERE DATE(created_at) >= '2025-06-01'
    ORDER BY created_at
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

    -- Create activity log based on activity type
    IF log_record.activity_type = 'glucose_log' THEN
      INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
      VALUES (
        log_record.user_id,
        'feature_click',
        'add_glucose_log',
        session_id,
        log_record.created_at
      );

      -- Create page visit activity for glucose logs
      INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
      VALUES (
        log_record.user_id,
        'page_visit',
        '/add-log',
        session_id,
        log_record.created_at - INTERVAL '2 minutes'
      );
    ELSE
      -- AI assistant activity
      INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
      VALUES (
        log_record.user_id,
        'feature_click',
        'ai_assistant',
        session_id,
        log_record.created_at
      );

      -- Create page visit activity for AI assistant
      INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
      VALUES (
        log_record.user_id,
        'page_visit',
        '/assistant',
        session_id,
        log_record.created_at - INTERVAL '2 minutes'
      );
    END IF;
  END LOOP;

  -- Create retention cohorts based on first activity (either health data or AI assistant) from June 1, 2025 onwards
  INSERT INTO public.user_retention_cohorts (user_id, signup_date, last_activity_date)
  SELECT 
    user_id,
    GREATEST(MIN(activity_date), DATE('2025-06-01')) as signup_date,
    MAX(activity_date) as last_activity_date
  FROM (
    SELECT user_id, DATE(created_at) as activity_date FROM public.glucose_logs WHERE DATE(created_at) >= '2025-06-01'
    UNION
    SELECT user_id, DATE(created_at) as activity_date FROM public.assistant_conversations WHERE DATE(created_at) >= '2025-06-01'
  ) combined_activity
  GROUP BY user_id;

  -- Update retention flags based on activity patterns from June 1, 2025 onwards
  UPDATE public.user_retention_cohorts 
  SET 
    day_1_return = EXISTS (
      SELECT 1 FROM (
        SELECT user_id, DATE(created_at) as activity_date FROM public.glucose_logs WHERE DATE(created_at) >= '2025-06-01'
        UNION
        SELECT user_id, DATE(created_at) as activity_date FROM public.assistant_conversations WHERE DATE(created_at) >= '2025-06-01'
      ) activity
      WHERE activity.user_id = user_retention_cohorts.user_id 
      AND activity.activity_date = signup_date + INTERVAL '1 day'
    ),
    day_7_return = EXISTS (
      SELECT 1 FROM (
        SELECT user_id, DATE(created_at) as activity_date FROM public.glucose_logs WHERE DATE(created_at) >= '2025-06-01'
        UNION
        SELECT user_id, DATE(created_at) as activity_date FROM public.assistant_conversations WHERE DATE(created_at) >= '2025-06-01'
      ) activity
      WHERE activity.user_id = user_retention_cohorts.user_id 
      AND activity.activity_date BETWEEN signup_date + INTERVAL '7 days' AND signup_date + INTERVAL '14 days'
    ),
    day_30_return = EXISTS (
      SELECT 1 FROM (
        SELECT user_id, DATE(created_at) as activity_date FROM public.glucose_logs WHERE DATE(created_at) >= '2025-06-01'
        UNION
        SELECT user_id, DATE(created_at) as activity_date FROM public.assistant_conversations WHERE DATE(created_at) >= '2025-06-01'
      ) activity
      WHERE activity.user_id = user_retention_cohorts.user_id 
      AND activity.activity_date >= signup_date + INTERVAL '30 days'
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

  RAISE NOTICE 'Analytics data backfill completed successfully - processed all health data and AI assistant activity from June 1, 2025 onwards';
END;
$$;
