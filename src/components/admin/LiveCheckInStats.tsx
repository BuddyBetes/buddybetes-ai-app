import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface LiveCheckInStatsProps {
  eventId: string;
}

interface Stats {
  total: number;
  checkedIn: number;
  pending: number;
  percentage: number;
}

const LiveCheckInStats = ({ eventId }: LiveCheckInStatsProps) => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentage: 0,
  });

  useEffect(() => {
    loadStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('event-checkin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const loadStats = async () => {
    try {
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('checked_in')
        .eq('event_id', eventId);

      if (error) throw error;

      const total = registrations?.length || 0;
      const checkedIn = registrations?.filter(r => r.checked_in).length || 0;
      const pending = total - checkedIn;
      const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

      setStats({ total, checkedIn, pending, percentage });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Registered',
      value: stats.total,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Checked In',
      value: stats.checkedIn,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      title: 'Check-in Rate',
      value: `${stats.percentage}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} flex-shrink-0`} />
                <span className="truncate">{stat.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LiveCheckInStats;
