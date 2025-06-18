
-- Update the enhanced daily active users function to correctly count all new users
CREATE OR REPLACE FUNCTION public.update_daily_active_users_enhanced()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert today's stats with corrected new user calculation
  INSERT INTO public.daily_active_users (date, total_active_users, new_users, returning_users, total_sessions)
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT combined_activity.user_id) as total_active_users,
    -- NEW: Count ALL users who created profiles today (regardless of activity)
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = CURRENT_DATE) as new_users,
    -- FIXED: Count active users who signed up before today
    COUNT(DISTINCT CASE WHEN DATE(p.created_at) < CURRENT_DATE THEN combined_activity.user_id END) as returning_users,
    COUNT(DISTINCT s.id) as total_sessions
  FROM (
    -- Combine users from both glucose logs and assistant conversations for today
    SELECT user_id, created_at FROM public.glucose_logs WHERE DATE(created_at) = CURRENT_DATE
    UNION
    SELECT user_id, created_at FROM public.assistant_conversations WHERE DATE(created_at) = CURRENT_DATE
  ) combined_activity
  LEFT JOIN public.profiles p ON combined_activity.user_id = p.id
  LEFT JOIN public.user_sessions s ON s.user_id = combined_activity.user_id AND DATE(s.session_start) = CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_active_users = EXCLUDED.total_active_users,
    new_users = EXCLUDED.new_users,
    returning_users = EXCLUDED.returning_users,
    total_sessions = EXCLUDED.total_sessions,
    updated_at = now();
END;
$$;

-- Update the backfill function to use the same corrected logic
CREATE OR REPLACE FUNCTION public.backfill_analytics_data()
 RETURNS void
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

  -- Process each activity from June 1, 2025 onwards to create proper sessions and activity
  FOR log_record IN 
    SELECT user_id, created_at, DATE(created_at) as log_date, 'glucose_log' as activity_type
    FROM public.glucose_logs 
    WHERE DATE(created_at) >= '2025-06-01'
    UNION ALL
    SELECT user_id, created_at, DATE(created_at) as log_date, 'assistant_conversation' as activity_type
    FROM public.assistant_conversations 
    WHERE DATE(created_at) >= '2025-06-01'
    ORDER BY user_id, created_at
  LOOP
    -- Check if there's already a session for this user on this date within 1 hour
    SELECT id INTO session_id
    FROM public.user_sessions
    WHERE user_id = log_record.user_id
    AND DATE(session_start) = log_record.log_date
    AND session_start <= log_record.created_at + INTERVAL '1 hour'
    AND session_start >= log_record.created_at - INTERVAL '1 hour'
    ORDER BY session_start DESC
    LIMIT 1;

    -- If no recent session exists, create a new one
    IF session_id IS NULL THEN
      INSERT INTO public.user_sessions (user_id, session_start, session_end, device_type, browser)
      VALUES (
        log_record.user_id,
        log_record.created_at - INTERVAL '5 minutes', -- Start session slightly before activity
        log_record.created_at + INTERVAL '25 minutes', -- 30-minute sessions
        'mobile',
        'Chrome'
      )
      RETURNING id INTO session_id;
    END IF;

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

      INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
      VALUES (
        log_record.user_id,
        'page_visit',
        '/add-log',
        session_id,
        log_record.created_at - INTERVAL '2 minutes'
      );
    ELSE
      INSERT INTO public.user_activity_logs (user_id, action_type, action_target, session_id, timestamp)
      VALUES (
        log_record.user_id,
        'feature_click',
        'ai_assistant',
        session_id,
        log_record.created_at
      );

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

  -- Create retention cohorts based on actual account creation dates from profiles table
  INSERT INTO public.user_retention_cohorts (user_id, signup_date, last_activity_date)
  SELECT 
    p.id as user_id,
    GREATEST(DATE(p.created_at), DATE('2025-06-01')) as signup_date,
    MAX(activity_date) as last_activity_date
  FROM public.profiles p
  LEFT JOIN (
    SELECT user_id, DATE(created_at) as activity_date FROM public.glucose_logs WHERE DATE(created_at) >= '2025-06-01'
    UNION
    SELECT user_id, DATE(created_at) as activity_date FROM public.assistant_conversations WHERE DATE(created_at) >= '2025-06-01'
  ) combined_activity ON p.id = combined_activity.user_id
  WHERE DATE(p.created_at) >= '2025-06-01' OR combined_activity.user_id IS NOT NULL
  GROUP BY p.id, p.created_at;

  -- Update retention flags based on activity patterns from account creation dates
  UPDATE public.user_retention_cohorts 
  SET 
    day_1_return = EXISTS (
      SELECT 1 FROM (
        SELECT user_id, DATE(created_at) as activity_date FROM public.glucose_logs WHERE DATE(created_at) >= '2025-06-01'
        UNION
        SELECT user_id, DATE(created_at) as activity_date FROM public.assistant_conversations WHERE DATE(created_at) >= '2025-06-01'
      ) activity
      WHERE activity.user_id = user_retention_cohorts.user_id 
      AND activity.activity_date BETWEEN signup_date AND signup_date + INTERVAL '1 day'
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

  -- FIXED: Generate daily active users with corrected new user calculation
  INSERT INTO public.daily_active_users (date, total_active_users, new_users, returning_users, total_sessions)
  SELECT 
    session_date,
    COUNT(DISTINCT s.user_id) as total_active_users,
    -- NEW: Count ALL users who signed up on this date (regardless of activity)
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = session_date) as new_users,
    -- FIXED: Count active users who signed up before this date
    COUNT(DISTINCT CASE WHEN DATE(p.created_at) < session_date THEN s.user_id END) as returning_users,
    COUNT(*) as total_sessions
  FROM public.user_sessions s
  JOIN public.profiles p ON s.user_id = p.id
  WHERE DATE(s.session_start) >= '2025-06-01'
  GROUP BY DATE(s.session_start)
  ORDER BY session_date;

  RAISE NOTICE 'Analytics data backfill completed successfully - new users now correctly counts all daily signups';
END;
$$;
