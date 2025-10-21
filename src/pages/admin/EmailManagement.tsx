import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Email Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage email templates and view logs</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full sm:flex-1"
            />
            <select 
              className="border rounded px-3 py-2 w-full sm:w-auto"
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
            >
              <option value="confirmation">Email Confirmation</option>
              <option value="password_reset">Password Reset</option>
              <option value="payment_receipt">Payment Receipt</option>
            </select>
            <Button onClick={sendTestEmail} className="w-full sm:w-auto">Send Test</Button>
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
              <div key={log.id} className="border-b pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <p className="font-semibold text-sm sm:text-base">{log.subject}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-all">{log.recipient_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.sent_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="self-start sm:self-auto">
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailManagement;
