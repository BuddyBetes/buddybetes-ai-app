
import { supabase } from '@/integrations/supabase/client';

interface ParsedVoiceData {
  isGlucoseLog: boolean;
  isFoodLog: boolean;
  glucoseLevel: number | null;
  food: string | null;
  mealContext: "before" | "after" | "fasting" | null;
  notes: string | null;
  error?: string;
}

export const parseVoiceInput = async (message: string): Promise<ParsedVoiceData> => {
  try {
    console.log("Sending voice input for parsing:", message);
    
    const { data, error } = await supabase.functions.invoke('parse-voice-input', {
      body: { message }
    });

    if (error) {
      console.error("Error invoking parse-voice-input function:", error);
      throw new Error(`Error parsing voice input: ${error.message}`);
    }

    console.log("Parsed voice data:", data);
    
    // Ensure we have a valid response format
    return {
      isGlucoseLog: !!data.isGlucoseLog,
      isFoodLog: !!data.isFoodLog,
      glucoseLevel: data.glucoseLevel !== undefined ? data.glucoseLevel : null,
      food: data.food || null,
      mealContext: data.mealContext || null,
      notes: data.notes || null
    };
  } catch (error) {
    console.error("Error in parseVoiceInput:", error);
    // Return a default structure on error
    return {
      isGlucoseLog: false,
      isFoodLog: false,
      glucoseLevel: null,
      food: null,
      mealContext: null,
      notes: null,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
