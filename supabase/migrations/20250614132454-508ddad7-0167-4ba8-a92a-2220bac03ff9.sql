
-- Add fat column to glucose_logs table
ALTER TABLE public.glucose_logs 
ADD COLUMN fat NUMERIC;

-- Add comment to document the new column
COMMENT ON COLUMN public.glucose_logs.fat IS 'Fat content in grams';
