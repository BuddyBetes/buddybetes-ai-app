import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
}

interface QueuedEmail {
  id: string;
  email_type: string;
  recipient_email: string;
  status: string;
  attempts: number;
  error_message: string | null;
  created_at: string;
}

export default function EmailHealth() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [queuedEmails, setQueuedEmails] = useState<QueuedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmailHealth = async () => {
    setLoading(true);
    try {
      // Fetch email queue stats
      const { data: queueData } = await supabase
        .from('email_queue')
        .select('status');

      if (queueData) {
        const total = queueData.length;
        const sent = queueData.filter(e => e.status === 'sent').length;
        const failed = queueData.filter(e => e.status === 'failed').length;
        const pending = queueData.filter(e => e.status === 'pending').length;
        
        setStats({
          total,
          sent,
          failed,
          pending,
          successRate: total > 0 ? (sent / total) * 100 : 0
        });
      }

      // Fetch failed/pending emails
      const { data: failedEmails } = await supabase
        .from('email_queue')
        .select('*')
        .in('status', ['failed', 'pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (failedEmails) {
        setQueuedEmails(failedEmails);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching email health',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    try {
      toast({
        title: 'Processing queue...',
        description: 'Starting email queue worker'
      });

      const { error } = await supabase.functions.invoke('email-queue-worker');
      
      if (error) throw error;
      
      toast({
        title: 'Queue processing started',
        description: 'Emails are being processed in the background'
      });
      
      // Refresh after 3 seconds
      setTimeout(fetchEmailHealth, 3000);
    } catch (error: any) {
      toast({
        title: 'Error processing queue',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchEmailHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEmailHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Health Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={fetchEmailHealth} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={processQueue} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Process Queue
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Emails</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Queue Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Email Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Recipient</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Attempts</th>
                  <th className="text-left p-2">Error</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {queuedEmails.map((email) => (
                  <tr key={email.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant="outline">{email.email_type}</Badge>
                    </td>
                    <td className="p-2 font-mono text-sm">{email.recipient_email}</td>
                    <td className="p-2">
                      <Badge variant={
                        email.status === 'sent' ? 'default' :
                        email.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {email.status}
                      </Badge>
                    </td>
                    <td className="p-2">{email.attempts}/3</td>
                    <td className="p-2 text-sm text-red-600 max-w-xs truncate">
                      {email.error_message || '-'}
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(email.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {queuedEmails.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      No pending or failed emails
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
