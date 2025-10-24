import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import type { DailyActiveUser } from "@/types/metrics";

interface DailyActiveUsersChartProps {
  data: DailyActiveUser[];
}

export const DailyActiveUsersChart = ({ data }: DailyActiveUsersChartProps) => {
  // Take last 30 days and format for chart
  const chartData = data.slice(0, 30).reverse().map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    total: day.total_active_users,
    new: day.new_users,
    returning: day.returning_users,
  }));

  // Calculate trend
  const firstDay = data[data.length - 1]?.total_active_users || 0;
  const lastDay = data[0]?.total_active_users || 0;
  const percentChange = firstDay > 0 
    ? ((lastDay - firstDay) / firstDay * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Active Users (Last 30 Days)</CardTitle>
        <CardDescription>
          {lastDay} active users today
          <span className={Number(percentChange) >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
            {Number(percentChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(percentChange))}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorTotal)"
              name="Total Active"
            />
            <Area 
              type="monotone" 
              dataKey="new" 
              stroke="hsl(var(--chart-2))" 
              fillOpacity={1} 
              fill="url(#colorNew)"
              name="New Users"
            />
            <Area 
              type="monotone" 
              dataKey="returning" 
              stroke="hsl(var(--chart-3))" 
              fillOpacity={1} 
              fill="url(#colorReturning)"
              name="Returning"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DailyActiveUsersChart;
