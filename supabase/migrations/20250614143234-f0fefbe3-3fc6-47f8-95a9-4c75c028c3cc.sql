
-- Add medication column to glucose_logs table if it doesn't exist
ALTER TABLE public.glucose_logs 
ADD COLUMN IF NOT EXISTS medication text;
