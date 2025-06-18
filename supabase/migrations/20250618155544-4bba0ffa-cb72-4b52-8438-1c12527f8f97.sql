
-- Create an admin-only analytics function that bypasses RLS to get correct counts
CREATE OR REPLACE FUNCTION public.get_analytics_retention_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_registered_users INTEGER;
  active_users_count INTEGER;
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

  -- Get active users (those with glucose logs from June 1, 2025 onwards)
  SELECT COUNT(DISTINCT user_id) INTO active_users_count
  FROM public.glucose_logs
  WHERE DATE(created_at) >= '2025-06-01';

  -- Get retention data from user_retention_cohorts
  SELECT COUNT(*) INTO day_1_returns
  FROM public.user_retention_cohorts
  WHERE day_1_return = true 
  AND signup_date >= '2025-06-01';

  SELECT COUNT(*) INTO day_7_returns
  FROM public.user_retention_cohorts
  WHERE day_7_return = true 
  AND signup_date >= '2025-06-01';

  SELECT COUNT(*) INTO day_30_returns
  FROM public.user_retention_cohorts
  WHERE day_30_return = true 
  AND signup_date >= '2025-06-01';

  -- Calculate percentages
  engagement_rate := CASE 
    WHEN total_registered_users > 0 THEN (active_users_count::NUMERIC / total_registered_users::NUMERIC) * 100
    ELSE 0
  END;

  day_1_retention := CASE 
    WHEN active_users_count > 0 THEN (day_1_returns::NUMERIC / active_users_count::NUMERIC) * 100
    ELSE 0
  END;

  day_7_retention := CASE 
    WHEN active_users_count > 0 THEN (day_7_returns::NUMERIC / active_users_count::NUMERIC) * 100
    ELSE 0
  END;

  day_30_retention := CASE 
    WHEN active_users_count > 0 THEN (day_30_returns::NUMERIC / active_users_count::NUMERIC) * 100
    ELSE 0
  END;

  -- Build result JSON
  result := json_build_object(
    'total_registered_users', total_registered_users,
    'total_users', active_users_count,
    'day_1_retention', day_1_retention,
    'day_7_retention', day_7_retention,
    'day_30_retention', day_30_retention,
    'engagement_rate', engagement_rate
  );

  RETURN result;
END;
$$;
