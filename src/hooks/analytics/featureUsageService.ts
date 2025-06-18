
import { supabase } from '@/integrations/supabase/client';
import type { FeatureUsage } from './types';

export const fetchFeatureUsage = async (startDate: Date, endDate: Date): Promise<FeatureUsage[]> => {
  // Set time boundaries for the date range
  const startDateTime = new Date(startDate);
  startDateTime.setHours(0, 0, 0, 0);
  
  const endDateTime = new Date(endDate);
  endDateTime.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('action_target')
    .eq('action_type', 'feature_click')
    .gte('timestamp', startDateTime.toISOString())
    .lte('timestamp', endDateTime.toISOString());

  if (!error && data) {
    const featureCount: { [key: string]: number } = {};
    
    data.forEach(log => {
      const feature = log.action_target || 'unknown';
      featureCount[feature] = (featureCount[feature] || 0) + 1;
    });

    const featureArray = Object.entries(featureCount)
      .map(([feature, count]) => ({ feature, usage_count: count }))
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10);

    console.log('✅ Fetched feature usage data from', startDate.toDateString(), 'to', endDate.toDateString(), ':', featureArray.length, 'features tracked');
    return featureArray;
  } else {
    console.error('Error fetching feature usage:', error);
    return [];
  }
};
