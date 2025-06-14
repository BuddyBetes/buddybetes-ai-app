
-- Add nutritional data columns to glucose_logs table
ALTER TABLE public.glucose_logs 
ADD COLUMN calories NUMERIC,
ADD COLUMN protein NUMERIC,
ADD COLUMN carbs NUMERIC;

-- Add comments to document the new columns
COMMENT ON COLUMN public.glucose_logs.calories IS 'Calories in kcal';
COMMENT ON COLUMN public.glucose_logs.protein IS 'Protein content in grams';
COMMENT ON COLUMN public.glucose_logs.carbs IS 'Carbohydrate content in grams';
