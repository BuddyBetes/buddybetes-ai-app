
import { supabase } from '@/integrations/supabase/client';

export const runBackfillIfNeeded = async (): Promise<boolean> => {
  try {
    console.log('🔄 Running FIXED analytics backfill (new users now counts ALL daily signups, not just active ones)...');
    
    // Run the updated backfill function with corrected new user logic
    const { error } = await supabase.rpc('backfill_analytics_data');
    
    if (error) {
      console.error('Error running backfill:', error);
      return false;
    } else {
      console.log('🎉 FIXED analytics backfill completed successfully!');
      console.log('📊 Key improvements:');
      console.log('   • New users now correctly counts ALL daily signups (not just active ones)');
      console.log('   • Better session grouping (activities within 1 hour grouped together)');
      console.log('   • Retention calculated from real signup dates');
      return true;
    }
  } catch (error) {
    console.error('Error running backfill:', error);
    return false;
  }
};
