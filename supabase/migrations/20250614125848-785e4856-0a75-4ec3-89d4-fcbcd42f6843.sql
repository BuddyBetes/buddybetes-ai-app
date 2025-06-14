
-- Add glucose_measurement_method column to glucose_logs table
ALTER TABLE public.glucose_logs 
ADD COLUMN glucose_measurement_method TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.glucose_logs.glucose_measurement_method IS 'Method used to measure glucose: finger_prick or cgm';
