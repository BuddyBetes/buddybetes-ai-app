
-- Migration to convert nutrition data from notes to structured fields
-- This will parse notes like "Carbs: 46g, Protein: 10g, Fat: 3g, Calories: 319" 
-- and move the data to proper columns

CREATE OR REPLACE FUNCTION migrate_nutrition_from_notes()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    log_record RECORD;
    calories_match TEXT;
    protein_match TEXT;
    carbs_match TEXT;
    fat_match TEXT;
    calories_value NUMERIC;
    protein_value NUMERIC;
    carbs_value NUMERIC;
    fat_value NUMERIC;
    cleaned_notes TEXT;
BEGIN
    -- Loop through all logs that have notes
    FOR log_record IN 
        SELECT id, notes, calories, protein, carbs, fat
        FROM glucose_logs 
        WHERE notes IS NOT NULL AND notes != ''
    LOOP
        -- Initialize variables
        calories_value := log_record.calories;
        protein_value := log_record.protein;
        carbs_value := log_record.carbs;
        fat_value := log_record.fat;
        cleaned_notes := log_record.notes;
        
        -- Extract calories if not already set
        IF calories_value IS NULL THEN
            calories_match := (regexp_match(log_record.notes, 'Calories?:?\s*(\d+(?:\.\d+)?)', 'i'))[1];
            IF calories_match IS NOT NULL THEN
                calories_value := calories_match::NUMERIC;
                -- Remove calories from notes
                cleaned_notes := regexp_replace(cleaned_notes, 'Calories?:?\s*\d+(?:\.\d+)?\s*(?:kcal|calories?)?\s*,?\s*', '', 'gi');
            END IF;
        END IF;
        
        -- Extract protein if not already set
        IF protein_value IS NULL THEN
            protein_match := (regexp_match(log_record.notes, 'Protein:?\s*(\d+(?:\.\d+)?)', 'i'))[1];
            IF protein_match IS NOT NULL THEN
                protein_value := protein_match::NUMERIC;
                -- Remove protein from notes
                cleaned_notes := regexp_replace(cleaned_notes, 'Protein:?\s*\d+(?:\.\d+)?\s*g?\s*,?\s*', '', 'gi');
            END IF;
        END IF;
        
        -- Extract carbs if not already set
        IF carbs_value IS NULL THEN
            carbs_match := (regexp_match(log_record.notes, 'Carbs?:?\s*(\d+(?:\.\d+)?)', 'i'))[1];
            IF carbs_match IS NOT NULL THEN
                carbs_value := carbs_match::NUMERIC;
                -- Remove carbs from notes
                cleaned_notes := regexp_replace(cleaned_notes, 'Carbs?:?\s*\d+(?:\.\d+)?\s*g?\s*,?\s*', '', 'gi');
            END IF;
        END IF;
        
        -- Extract fat if not already set
        IF fat_value IS NULL THEN
            fat_match := (regexp_match(log_record.notes, 'Fat:?\s*(\d+(?:\.\d+)?)', 'i'))[1];
            IF fat_match IS NOT NULL THEN
                fat_value := fat_match::NUMERIC;
                -- Remove fat from notes
                cleaned_notes := regexp_replace(cleaned_notes, 'Fat:?\s*\d+(?:\.\d+)?\s*g?\s*,?\s*', '', 'gi');
            END IF;
        END IF;
        
        -- Clean up any remaining commas and whitespace
        cleaned_notes := regexp_replace(cleaned_notes, '^\s*,?\s*', '');
        cleaned_notes := regexp_replace(cleaned_notes, '\s*,?\s*$', '');
        cleaned_notes := regexp_replace(cleaned_notes, '\s+', ' ', 'g');
        cleaned_notes := trim(cleaned_notes);
        
        -- Set to NULL if empty
        IF cleaned_notes = '' THEN
            cleaned_notes := NULL;
        END IF;
        
        -- Update the record if any nutrition data was found
        IF calories_value IS NOT NULL OR protein_value IS NOT NULL OR carbs_value IS NOT NULL OR fat_value IS NOT NULL THEN
            UPDATE glucose_logs 
            SET 
                calories = calories_value,
                protein = protein_value,
                carbs = carbs_value,
                fat = fat_value,
                notes = cleaned_notes
            WHERE id = log_record.id;
            
            RAISE NOTICE 'Updated log % - Calories: %, Protein: %, Carbs: %, Fat: %, Notes: %', 
                log_record.id, calories_value, protein_value, carbs_value, fat_value, 
                COALESCE(cleaned_notes, 'NULL');
        END IF;
    END LOOP;
END;
$$;

-- Run the migration
SELECT migrate_nutrition_from_notes();

-- Drop the function after use
DROP FUNCTION migrate_nutrition_from_notes();
