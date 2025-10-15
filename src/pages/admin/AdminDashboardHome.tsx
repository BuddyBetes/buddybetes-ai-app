import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatsCard from '@/components/admin/StatsCard';
import { Users, Mail, Calendar, DollarSign, FileText, Loader2, Tag, TicketPercent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const AdminDashboardHome = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profiles, receipts, emails, events, subscriptions, discountCodes, discountRedemptions] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('payment_receipts').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('email_logs').select('id', { count: 'exact', head: true }).gte('sent_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('discount_codes').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('discount_redemptions').select('id', { count: 'exact', head: true })
          .gte('redeemed_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()),
      ]);

      return {
        totalUsers: profiles.count || 0,
        pendingReceipts: receipts.count || 0,
        todayEmails: emails.count || 0,
        activeEvents: events.count || 0,
        activeSubscriptions: subscriptions.count || 0,
        activeDiscountCodes: discountCodes.count || 0,
        recentRedemptions: discountRedemptions.count || 0,
      };
    },
  });

  const quickActions = [
    { title: 'Payment Receipts', href: '/admin/receipts', icon: <FileText className="h-5 w-5" />, description: 'Review and approve payment receipts' },
    { title: 'Email Management', href: '/admin/emails', icon: <Mail className="h-5 w-5" />, description: 'View email logs and send test emails' },
    { title: 'Event Management', href: '/admin/events', icon: <Calendar className="h-5 w-5" />, description: 'Manage events and registrations' },
    { title: 'Discount Codes', href: '/admin/discounts', icon: <Tag className="h-5 w-5" />, description: 'Manage discount codes and redemptions' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the BuddyBetes Admin Portal</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
        />
        <StatsCard
          title="Pending Receipts"
          value={stats?.pendingReceipts || 0}
          icon={FileText}
        />
        <StatsCard
          title="Emails Sent Today"
          value={stats?.todayEmails || 0}
          icon={Mail}
        />
        <StatsCard
          title="Active Events"
          value={stats?.activeEvents || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={DollarSign}
        />
        <StatsCard
          title="Active Discount Codes"
          value={stats?.activeDiscountCodes || 0}
          icon={Tag}
        />
        <StatsCard
          title="Redemptions (30d)"
          value={stats?.recentRedemptions || 0}
          icon={TicketPercent}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(action.href)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {action.icon}
                  {action.title}
                </CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
