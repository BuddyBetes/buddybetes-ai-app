import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const EmailManagement = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState<'confirmation' | 'password_reset' | 'payment_receipt'>('confirmation');
  const { toast } = useToast();

  const { data: emailLogs, refetch } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const sendTestEmail = async () => {
    try {
      const { error } = await supabase.functions.invoke('test-email-templates', {
        body: { emailType: testType, recipientEmail: testEmail }
      });
      
      if (error) throw error;
      
      toast({ title: 'Test email sent successfully!' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Manage email templates and view logs</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <select 
                className="border rounded px-3"
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
              >
                <option value="confirmation">Email Confirmation</option>
                <option value="password_reset">Password Reset</option>
                <option value="payment_receipt">Payment Receipt</option>
              </select>
              <Button onClick={sendTestEmail}>Send Test</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailLogs?.map((log) => (
                <div key={log.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{log.subject}</p>
                      <p className="text-sm text-muted-foreground">{log.recipient_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.sent_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EmailManagement;
