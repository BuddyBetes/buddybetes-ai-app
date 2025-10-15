
-- Fix event_registrations RLS policy to avoid querying auth.users
-- This fixes the "permission denied for table users" error

-- Drop the problematic policy that tries to query auth.users
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

-- Create a new safe policy using profiles table instead of auth.users
-- This allows users to view registrations either by user_id or by email
CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations
FOR SELECT 
USING (
  -- Allow if user_id matches the authenticated user
  auth.uid() = user_id 
  OR 
  -- Allow if email matches the authenticated user's email from profiles
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Note: This assumes profiles.email is kept in sync with auth.users.email
-- which is handled by the handle_new_user() trigger
