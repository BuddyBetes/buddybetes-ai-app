
-- Add glucose_unit column to health_data table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'health_data' AND column_name = 'glucose_unit'
    ) THEN
        ALTER TABLE health_data ADD COLUMN glucose_unit TEXT DEFAULT 'mg/dL';
    END IF;
END
$$;
