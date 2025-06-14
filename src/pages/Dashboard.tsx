
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLogContext } from '../context/LogContext';
import AppHeader from '@/components/AppHeader';
import { useGlucoseInsights } from '@/hooks/useGlucoseInsights';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';
import DashboardStats from '@/components/dashboard/DashboardStats';
import GlucoseChartSection from '@/components/dashboard/GlucoseChartSection';
import InsightsSection from '@/components/dashboard/InsightsSection';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '3m' | '6m'>('7d');
  const { getGlucoseLogsOnly, getLogsForToday, getAverageGlucose, logs } = useLogContext();
  const { glucoseUnit } = useGlucoseUnit();
  
  // Get more data for longer time ranges
  const dataCount = timeRange === '6m' ? 180 : timeRange === '3m' ? 90 : 30;
  const glucoseLogs = getGlucoseLogsOnly(dataCount);
  
  const { insights, stats, analysis, isLoading, refreshInsights } = useGlucoseInsights(timeRange);
  const navigate = useNavigate();

  const lastReading = glucoseLogs[0]?.glucoseLevel || 0;
  const displayLastReading = lastReading > 0 ? 
    (glucoseUnit === 'mg/dL' ? 
      lastReading : 
      convertGlucoseValue(lastReading, 'mg/dL', 'mmol/L')
    ) : 0;
  
  const isInRange = lastReading >= 70 && lastReading <= 180;
  
  const logsToday = getLogsForToday().length;
  
  const averageGlucose = stats?.average || getAverageGlucose();
  const displayAverage = glucoseUnit === 'mg/dL' ? 
    averageGlucose : 
    convertGlucoseValue(averageGlucose, 'mg/dL', 'mmol/L');
  
  const lastFoodEntry = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).find(log => log.food && log.food.trim().length > 0);

  // Convert analysis data into insight cards
  const allInsights = React.useMemo(() => {
    const analysisInsights: string[] = [];
    
    if (analysis?.mealImpact) {
      analysisInsights.push(`Meal Impact Analysis: ${analysis.mealImpact}`);
    }
    if (analysis?.exerciseImpact) {
      analysisInsights.push(`Exercise Impact: ${analysis.exerciseImpact}`);
    }
    if (analysis?.timePatterns) {
      analysisInsights.push(`Time Pattern Analysis: ${analysis.timePatterns}`);
    }
    
    // Combine analysis insights with regular insights
    return [...analysisInsights, ...insights];
  }, [analysis, insights]);

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-5 pb-20">
        <DashboardStats
          lastFoodEntry={lastFoodEntry}
          lastReading={lastReading}
          displayLastReading={displayLastReading}
          isInRange={isInRange}
          glucoseLogs={glucoseLogs}
          displayAverage={displayAverage}
          logsToday={logsToday}
        />

        <GlucoseChartSection glucoseLogs={glucoseLogs} />

        <InsightsSection
          allInsights={allInsights}
          isLoading={isLoading}
          refreshInsights={refreshInsights}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
