-- Create function to get monthly active users
CREATE OR REPLACE FUNCTION public.get_monthly_active_users()
RETURNS TABLE(
  month date,
  total_users bigint,
  growth_percentage numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      DATE_TRUNC('month', date)::date as month,
      SUM(total_active_users)::bigint as total_users
    FROM public.daily_active_users
    WHERE date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', date)
    ORDER BY month DESC
  ),
  with_previous AS (
    SELECT 
      month,
      total_users,
      LAG(total_users) OVER (ORDER BY month) as previous_month_users
    FROM monthly_data
  )
  SELECT 
    month,
    total_users,
    CASE 
      WHEN previous_month_users IS NULL OR previous_month_users = 0 THEN 0
      ELSE ROUND(((total_users - previous_month_users)::numeric / previous_month_users::numeric) * 100, 2)
    END as growth_percentage
  FROM with_previous
  ORDER BY month DESC;
END;
$$;