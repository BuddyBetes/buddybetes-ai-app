
import { supabase } from '@/integrations/supabase/client';

export const runBackfillIfNeeded = async (): Promise<boolean> => {
  try {
    console.log('🔄 Running improved analytics backfill (now uses real account creation dates and better session logic)...');
    
    // Run the updated backfill function with improved logic
    const { error } = await supabase.rpc('backfill_analytics_data');
    
    if (error) {
      console.error('Error running backfill:', error);
      return false;
    } else {
      console.log('🎉 Improved analytics backfill completed successfully!');
      console.log('📊 New features:');
      console.log('   • New users now based on actual account creation dates');
      console.log('   • Better session grouping (activities within 1 hour grouped together)');
      console.log('   • Retention calculated from real signup dates');
      return true;
    }
  } catch (error) {
    console.error('Error running backfill:', error);
    return false;
  }
};
