
import { supabase } from '@/integrations/supabase/client';

export const runBackfillIfNeeded = async (): Promise<boolean> => {
  try {
    console.log('Running analytics backfill from June 1, 2025 onwards...');
    
    // Run the updated backfill function that starts from June 1, 2025
    const { error } = await supabase.rpc('backfill_analytics_data');
    
    if (error) {
      console.error('Error running backfill:', error);
      return false;
    } else {
      console.log('🎉 Backfill completed successfully! Analytics data from June 1, 2025 onwards');
      return true;
    }
  } catch (error) {
    console.error('Error running backfill:', error);
    return false;
  }
};
