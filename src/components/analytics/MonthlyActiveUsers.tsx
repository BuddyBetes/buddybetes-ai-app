import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyActiveUser {
  month: string;
  total_users: number;
  growth_percentage: number;
}

interface MonthlyActiveUsersProps {
  data: MonthlyActiveUser[];
}

const MonthlyActiveUsers = ({ data }: MonthlyActiveUsersProps) => {
  const chartData = data.map(item => ({
    month: format(new Date(item.month), 'MMM yyyy'),
    users: item.total_users,
    growth: item.growth_percentage
  })).reverse();

  const latestMonth = data[0];
  const previousMonth = data[1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Active Users (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No monthly data available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Current Month</p>
                <p className="text-2xl font-bold">{latestMonth?.total_users || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(latestMonth?.month || new Date()), 'MMMM yyyy')}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Previous Month</p>
                <p className="text-2xl font-bold">{previousMonth?.total_users || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {previousMonth ? format(new Date(previousMonth.month), 'MMMM yyyy') : 'N/A'}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Growth</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {latestMonth?.growth_percentage || 0}%
                  </p>
                  {(latestMonth?.growth_percentage || 0) >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Month-over-month</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyActiveUsers;
