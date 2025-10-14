import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { Users, CreditCard, Mail, Calendar, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminDashboardHome = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profiles, receipts, emails, events, subscriptions] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('payment_receipts').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('email_logs').select('id', { count: 'exact', head: true }).gte('sent_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      return {
        totalUsers: profiles.count || 0,
        pendingReceipts: receipts.count || 0,
        todayEmails: emails.count || 0,
        activeEvents: events.count || 0,
        activeSubscriptions: subscriptions.count || 0,
      };
    },
  });

  const quickActions = [
    { title: 'Payment Receipts', href: '/admin/payments', icon: CreditCard, description: 'Review pending receipts' },
    { title: 'Email Management', href: '/admin/emails', icon: Mail, description: 'View email logs' },
    { title: 'Role Management', href: '/admin/roles', icon: Shield, description: 'Manage user roles' },
    { title: 'Event Management', href: '/admin/events', icon: Calendar, description: 'Manage events' },
    { title: 'Analytics', href: '/admin/analytics', icon: TrendingUp, description: 'View analytics' },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the BuddyBetes admin portal</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            description="Registered users"
          />
          <StatsCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            icon={TrendingUp}
            description="Current subscribers"
          />
          <StatsCard
            title="Pending Receipts"
            value={stats?.pendingReceipts || 0}
            icon={CreditCard}
            description="Awaiting review"
          />
          <StatsCard
            title="Today's Emails"
            value={stats?.todayEmails || 0}
            icon={Mail}
            description="Sent today"
          />
          <StatsCard
            title="Active Events"
            value={stats?.activeEvents || 0}
            icon={Calendar}
            description="Ongoing events"
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Card key={action.href} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(action.href)}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <Button variant="ghost" size="sm" className="mt-2 w-full">
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardHome;
