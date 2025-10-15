import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import ReceiptViewer from '@/components/admin/ReceiptViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Check, X, Search, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

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

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full", color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PaymentReceipts = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // Calculate stats
  const pendingCount = receipts.filter(r => r.verification_status === 'pending').length;
  const approvedCount = receipts.filter(r => r.verification_status === 'approved').length;
  const rejectedCount = receipts.filter(r => r.verification_status === 'rejected').length;
  const totalRevenue = receipts
    .filter(r => r.verification_status === 'approved')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'border-l-yellow-500',
      approved: 'border-l-green-500',
      rejected: 'border-l-red-500',
    };
    return colors[status] || 'border-l-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Receipts</h1>
        <p className="text-muted-foreground">Review and approve payment receipts</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          color="text-yellow-600 bg-yellow-100"
        />
        <StatsCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle}
          color="text-green-600 bg-green-100"
        />
        <StatsCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          color="text-red-600 bg-red-100"
        />
        <StatsCard
          title="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-buddy-600 bg-buddy-100"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading receipts...</div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className={cn("overflow-hidden border-l-4 transition-shadow hover:shadow-md", getStatusColor(receipt.verification_status))}>
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
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReceipt(receipt)}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {receipt.verification_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateReceiptStatus(receipt.id, 'approved')}
                        className="w-full sm:w-auto"
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
                        className="w-full sm:w-auto"
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
  );
};

export default PaymentReceipts;
