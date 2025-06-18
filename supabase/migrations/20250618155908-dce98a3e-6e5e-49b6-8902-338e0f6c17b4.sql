
-- Update the retention analysis function to use proper profile-based retention calculation
CREATE OR REPLACE FUNCTION public.get_analytics_retention_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_registered_users INTEGER;
  active_users_count INTEGER;
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

  -- Get active users (those with any glucose logs)
  SELECT COUNT(DISTINCT user_id) INTO active_users_count
  FROM public.glucose_logs;

  -- Calculate cohort sizes (users who signed up at least X days ago)
  SELECT COUNT(*) INTO day_1_cohort_size
  FROM public.profiles
  WHERE created_at <= CURRENT_DATE - INTERVAL '1 day';

  SELECT COUNT(*) INTO day_7_cohort_size
  FROM public.profiles
  WHERE created_at <= CURRENT_DATE - INTERVAL '7 days';

  SELECT COUNT(*) INTO day_30_cohort_size
  FROM public.profiles
  WHERE created_at <= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate retention: users who returned within X days of signup
  -- Day 1 retention: users who logged health data within 1 day of profile creation
  SELECT COUNT(DISTINCT p.id) INTO day_1_returns
  FROM public.profiles p
  INNER JOIN public.glucose_logs gl ON p.id = gl.user_id
  WHERE p.created_at <= CURRENT_DATE - INTERVAL '1 day'
  AND gl.created_at BETWEEN p.created_at AND p.created_at + INTERVAL '1 day';

  -- Day 7 retention: users who logged health data within 7 days of profile creation
  SELECT COUNT(DISTINCT p.id) INTO day_7_returns
  FROM public.profiles p
  INNER JOIN public.glucose_logs gl ON p.id = gl.user_id
  WHERE p.created_at <= CURRENT_DATE - INTERVAL '7 days'
  AND gl.created_at BETWEEN p.created_at AND p.created_at + INTERVAL '7 days';

  -- Day 30 retention: users who logged health data within 30 days of profile creation
  SELECT COUNT(DISTINCT p.id) INTO day_30_returns
  FROM public.profiles p
  INNER JOIN public.glucose_logs gl ON p.id = gl.user_id
  WHERE p.created_at <= CURRENT_DATE - INTERVAL '30 days'
  AND gl.created_at BETWEEN p.created_at AND p.created_at + INTERVAL '30 days';

  -- Calculate percentages
  engagement_rate := CASE 
    WHEN total_registered_users > 0 THEN (active_users_count::NUMERIC / total_registered_users::NUMERIC) * 100
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
    'total_users', active_users_count,
    'day_1_retention', day_1_retention,
    'day_7_retention', day_7_retention,
    'day_30_retention', day_30_retention,
    'engagement_rate', engagement_rate
  );

  RETURN result;
END;
$$;
