-- Grant execute permission on is_admin function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Also grant to anon role for good measure
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;