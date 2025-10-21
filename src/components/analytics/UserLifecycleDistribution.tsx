import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';

interface LifecycleData {
  new_users: number;
  active_users: number;
  at_risk_users: number;
  churned_users: number;
}

interface UserLifecycleDistributionProps {
  data: LifecycleData | null;
}

const UserLifecycleDistribution = ({ data }: UserLifecycleDistributionProps) => {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Lifecycle Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            Loading lifecycle data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'New Users', value: data.new_users, color: '#35cab4', icon: Users },
    { name: 'Active Users', value: data.active_users, color: '#10b981', icon: TrendingUp },
    { name: 'At Risk', value: data.at_risk_users, color: '#f59e0b', icon: AlertTriangle },
    { name: 'Churned', value: data.churned_users, color: '#ef4444', icon: XCircle },
  ];

  const total = data.new_users + data.active_users + data.at_risk_users + data.churned_users;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">User Lifecycle Distribution</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">Current user engagement status</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {chartData.map((item) => {
              const Icon = item.icon;
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={item.name} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded" style={{ backgroundColor: item.color + '20' }}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-bold">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-muted-foreground">
          <div>
            <strong>New:</strong> Signed up within last 7 days
          </div>
          <div>
            <strong>Active:</strong> Used app within last 7 days
          </div>
          <div>
            <strong>At Risk:</strong> Inactive for 7-30 days
          </div>
          <div>
            <strong>Churned:</strong> Inactive for 30+ days
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserLifecycleDistribution;
