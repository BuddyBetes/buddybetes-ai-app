import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Receipt, Mail, Calendar, CreditCard, Ticket, TrendingUp, BarChart3, FileText, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import DayNavigator from '@/components/analytics/DayNavigator';
import OverviewMetricsSection from '@/components/analytics/OverviewMetricsSection';
import DailyMetricsSection from '@/components/analytics/DailyMetricsSection';
import MonthlyActiveUsers from '@/components/analytics/MonthlyActiveUsers';
import { useMetricsData } from '@/hooks/useMetricsData';

const AdminDashboardHome = () => {
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);

  const { 
    selectedDayData,
    previousDayData,
    retentionData, 
    engagementData, 
    featureUsage,
    availableDates,
    monthlyActiveUsers,
    loading, 
    refreshData 
  } = useMetricsData(selectedDateString || undefined);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDateString) {
      const mostRecentDate = [...availableDates].sort().reverse()[0];
      setSelectedDateString(mostRecentDate);
    }
  }, [availableDates, selectedDateString]);

  const quickActions = [
    { title: 'Payment Receipts', href: '/admin/receipts', icon: Receipt, description: 'Review payment receipts' },
    { title: 'Events', href: '/admin/events', icon: Calendar, description: 'Manage events' },
    { title: 'Discount Codes', href: '/admin/discounts', icon: Ticket, description: 'Manage discounts' },
    { title: 'Email Campaigns', href: '/admin/campaigns', icon: Megaphone, description: 'Create campaigns' },
    { title: 'Email Management', href: '/admin/emails', icon: Mail, description: 'Email logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track app usage and user engagement</p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <OverviewMetricsSection retentionData={retentionData} />

      <MonthlyActiveUsers data={monthlyActiveUsers} />

      {availableDates.length > 0 && selectedDateString && (
        <>
          <DayNavigator
            selectedDateString={selectedDateString}
            onDateChange={setSelectedDateString}
            availableDates={availableDates}
          />

          <DailyMetricsSection
            selectedDateString={selectedDateString}
            dailyData={selectedDayData}
            previousDayData={previousDayData}
          />
        </>
      )}

      {availableDates.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No historical data available yet</p>
          <p className="text-sm">Daily metrics will appear here once users start using the app</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementHeatmap 
          data={engagementData} 
          selectedDateString={selectedDateString || undefined}
        />
        <FeatureUsageChart data={featureUsage} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <action.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{action.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
