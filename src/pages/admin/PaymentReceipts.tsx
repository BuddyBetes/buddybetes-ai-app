import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import ReceiptViewer from '@/components/admin/ReceiptViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, Search } from 'lucide-react';

interface PaymentReceipt {
  id: string;
  user_id: string;
  subscription_id: string;
  receipt_url: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  verification_status: string;
  created_at: string;
  user_email?: string;
}

const PaymentReceipts = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data: receiptsData, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails separately
      const userIds = receiptsData?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      const receiptsWithEmail = receiptsData?.map(receipt => ({
        ...receipt,
        user_email: emailMap.get(receipt.user_id) || 'Unknown',
      })) || [];

      setReceipts(receiptsWithEmail);
    } catch (error: any) {
      toast({
        title: 'Error fetching receipts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReceiptStatus = async (receiptId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? rejectionReason : null,
        })
        .eq('id', receiptId);

      if (error) throw error;

      if (status === 'approved') {
        const receipt = receipts.find(r => r.id === receiptId);
        if (receipt) {
          await supabase
            .from('user_subscriptions')
            .update({ status: 'active' })
            .eq('id', receipt.subscription_id);
        }
      }

      toast({
        title: 'Success',
        description: `Receipt ${status}`,
      });

      fetchReceipts();
      setSelectedReceipt(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredReceipts = receipts.filter(receipt =>
    receipt.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Receipts</h1>
          <p className="text-muted-foreground">Review and approve payment receipts</p>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">Loading receipts...</div>
        ) : (
          <div className="grid gap-4 grid-cols-1">
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{receipt.user_email}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(receipt.created_at).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(receipt.verification_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">₱{receipt.amount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Method</p>
                      <p className="font-medium">{receipt.payment_method}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Reference</p>
                      <p className="font-medium">{receipt.reference_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {receipt.verification_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateReceiptStatus(receipt.id, 'approved')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) updateReceiptStatus(receipt.id, 'rejected', reason);
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredReceipts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No receipts found
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedReceipt && (
          <ReceiptViewer
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            onStatusUpdate={(receiptId, status, reason) => updateReceiptStatus(receiptId, status, reason)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentReceipts;
