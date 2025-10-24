import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { format, startOfMonth } from "date-fns";
import type { DailyActiveUser } from "@/types/metrics";

interface MonthlyActiveUsersChartProps {
  dailyData: DailyActiveUser[];
}

interface MonthlyData {
  month: string;
  totalUsers: number;
  growthPercentage: number;
}

const calculateMonthlyActiveUsers = (dailyData: DailyActiveUser[]): MonthlyData[] => {
  const monthlyMap = new Map<string, number>();

  dailyData.forEach(day => {
    const monthKey = format(startOfMonth(new Date(day.date)), 'yyyy-MM');
    const currentTotal = monthlyMap.get(monthKey) || 0;
    monthlyMap.set(monthKey, currentTotal + day.total_active_users);
  });

  const months = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  return months.map((entry, index) => {
    const [monthKey, totalUsers] = entry;
    const previousTotal = index > 0 ? months[index - 1][1] : 0;
    const growthPercentage = previousTotal > 0 
      ? ((totalUsers - previousTotal) / previousTotal) * 100 
      : 0;

    return {
      month: format(new Date(monthKey + '-01'), 'MMM yyyy'),
      totalUsers: Math.round(totalUsers),
      growthPercentage: Math.round(growthPercentage * 10) / 10,
    };
  });
};

export const MonthlyActiveUsersChart = ({ dailyData }: MonthlyActiveUsersChartProps) => {
  const monthlyData = calculateMonthlyActiveUsers(dailyData);
  const latestMonth = monthlyData[monthlyData.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Active Users (Last 6 Months)</CardTitle>
        <CardDescription>
          {latestMonth?.totalUsers.toLocaleString()} active users this month
          {latestMonth && (
            <span className={latestMonth.growthPercentage >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
              {latestMonth.growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(latestMonth.growthPercentage)}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
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
              formatter={(value: number, name: string) => {
                if (name === 'totalUsers') return [value.toLocaleString(), 'Active Users'];
                return [value + '%', 'Growth'];
              }}
            />
            <Bar dataKey="totalUsers" radius={[8, 8, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.growthPercentage >= 0 
                    ? "hsl(var(--primary))" 
                    : "hsl(var(--destructive))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyActiveUsersChart;
