
-- Fix the get_analytics_retention_data function to use actual account creation dates
CREATE OR REPLACE FUNCTION public.get_analytics_retention_data()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  total_registered_users INTEGER;
  health_data_users INTEGER;
  ai_assistant_users INTEGER;
  total_active_users INTEGER;
  day_1_cohort_size INTEGER;
  day_7_cohort_size INTEGER;
  day_30_cohort_size INTEGER;
  day_1_returns INTEGER;
  day_7_returns INTEGER;
  day_30_returns INTEGER;
  engagement_rate NUMERIC;
  day_1_retention NUMERIC;
  day_7_retention NUMERIC;
  day_30_retention NUMERIC;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total registered users from profiles table
  SELECT COUNT(*) INTO total_registered_users
  FROM public.profiles;

  -- Get health data users (those with any glucose logs)
  SELECT COUNT(DISTINCT user_id) INTO health_data_users
  FROM public.glucose_logs;

  -- Get AI assistant users (those with assistant conversations)
  SELECT COUNT(DISTINCT user_id) INTO ai_assistant_users
  FROM public.assistant_conversations;

  -- Get total active users (users who have either logged health data OR used AI assistant)
  SELECT COUNT(DISTINCT user_id) INTO total_active_users
  FROM (
    SELECT user_id FROM public.glucose_logs
    UNION
    SELECT user_id FROM public.assistant_conversations
  ) combined_users;

  -- Calculate cohort sizes (users who signed up at least X days ago) - FIXED to use profiles.created_at
  SELECT COUNT(*) INTO day_1_cohort_size
  FROM public.profiles
  WHERE DATE(created_at) <= CURRENT_DATE - INTERVAL '1 day';

  SELECT COUNT(*) INTO day_7_cohort_size
  FROM public.profiles
  WHERE DATE(created_at) <= CURRENT_DATE - INTERVAL '7 days';

  SELECT COUNT(*) INTO day_30_cohort_size
  FROM public.profiles
  WHERE DATE(created_at) <= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate retention: users who used the app within X days of account creation - FIXED
  -- Day 1 retention: users who had any activity within 1 day of account creation
  SELECT COUNT(DISTINCT p.id) INTO day_1_returns
  FROM public.profiles p
  WHERE DATE(p.created_at) <= CURRENT_DATE - INTERVAL '1 day'
  AND (
    EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = p.id 
      AND DATE(gl.created_at) BETWEEN DATE(p.created_at) AND DATE(p.created_at) + INTERVAL '1 day'
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.assistant_conversations ac 
      WHERE ac.user_id = p.id 
      AND DATE(ac.created_at) BETWEEN DATE(p.created_at) AND DATE(p.created_at) + INTERVAL '1 day'
    )
  );

  -- Day 7 retention: users who had any activity within 7 days of account creation
  SELECT COUNT(DISTINCT p.id) INTO day_7_returns
  FROM public.profiles p
  WHERE DATE(p.created_at) <= CURRENT_DATE - INTERVAL '7 days'
  AND (
    EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = p.id 
      AND DATE(gl.created_at) BETWEEN DATE(p.created_at) AND DATE(p.created_at) + INTERVAL '7 days'
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.assistant_conversations ac 
      WHERE ac.user_id = p.id 
      AND DATE(ac.created_at) BETWEEN DATE(p.created_at) AND DATE(p.created_at) + INTERVAL '7 days'
    )
  );

  -- Day 30 retention: users who had any activity within 30 days of account creation
  SELECT COUNT(DISTINCT p.id) INTO day_30_returns
  FROM public.profiles p
  WHERE DATE(p.created_at) <= CURRENT_DATE - INTERVAL '30 days'
  AND (
    EXISTS (
      SELECT 1 FROM public.glucose_logs gl 
      WHERE gl.user_id = p.id 
      AND DATE(gl.created_at) BETWEEN DATE(p.created_at) AND DATE(p.created_at) + INTERVAL '30 days'
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.assistant_conversations ac 
      WHERE ac.user_id = p.id 
      AND DATE(ac.created_at) BETWEEN DATE(p.created_at) AND DATE(p.created_at) + INTERVAL '30 days'
    )
  );

  -- Calculate percentages
  engagement_rate := CASE 
    WHEN total_registered_users > 0 THEN (total_active_users::NUMERIC / total_registered_users::NUMERIC) * 100
    ELSE 0
  END;

  day_1_retention := CASE 
    WHEN day_1_cohort_size > 0 THEN (day_1_returns::NUMERIC / day_1_cohort_size::NUMERIC) * 100
    ELSE 0
  END;

  day_7_retention := CASE 
    WHEN day_7_cohort_size > 0 THEN (day_7_returns::NUMERIC / day_7_cohort_size::NUMERIC) * 100
    ELSE 0
  END;

  day_30_retention := CASE 
    WHEN day_30_cohort_size > 0 THEN (day_30_returns::NUMERIC / day_30_cohort_size::NUMERIC) * 100
    ELSE 0
  END;

  -- Build result JSON
  result := json_build_object(
    'total_registered_users', total_registered_users,
    'total_users', health_data_users,
    'total_active_users', total_active_users,
    'health_data_users', health_data_users,
    'ai_assistant_users', ai_assistant_users,
    'day_1_retention', day_1_retention,
    'day_7_retention', day_7_retention,
    'day_30_retention', day_30_retention,
    'engagement_rate', engagement_rate
  );

  RETURN result;
END;
$$;

-- Update the enhanced daily active users function to use actual account creation dates
CREATE OR REPLACE FUNCTION public.update_daily_active_users_enhanced()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert today's stats using actual account creation dates
  INSERT INTO public.daily_active_users (date, total_active_users, new_users, returning_users, total_sessions)
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT combined_activity.user_id) as total_active_users,
    COUNT(DISTINCT CASE WHEN DATE(p.created_at) = CURRENT_DATE THEN combined_activity.user_id END) as new_users,
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

-- Update the backfill function to use actual account creation dates and fix session logic
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

  -- Generate daily active users from sessions with correct new user calculation
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
      (DATE(s.session_start) = DATE(p.created_at)) as is_new_user
    FROM public.user_sessions s
    JOIN public.profiles p ON s.user_id = p.id
    WHERE DATE(s.session_start) >= '2025-06-01'
  ) daily_stats
  GROUP BY session_date
  HAVING session_date >= '2025-06-01'
  ORDER BY session_date;

  RAISE NOTICE 'Analytics data backfill completed successfully - using actual account creation dates and improved session logic';
END;
$$;
