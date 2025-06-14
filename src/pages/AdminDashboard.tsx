
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Check, X, Download, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import ReceiptViewer from '@/components/admin/ReceiptViewer';

interface PaymentReceipt {
  id: string;
  user_id: string;
  subscription_id: string;
  receipt_url: string;
  payment_method: string;
  reference_number: string | null;
  amount: number;
  verification_status: string;
  created_at: string;
  user_email?: string;
}

const AdminDashboard = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<PaymentReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchReceipts();
    }
  }, [isAdmin]);

  useEffect(() => {
    const filtered = receipts.filter(receipt => 
      receipt.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReceipts(filtered);
  }, [searchTerm, receipts]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch receipts with user email from profiles
      const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const receiptsWithEmail = data.map(receipt => ({
        ...receipt,
        user_email: receipt.profiles?.email || 'Unknown'
      }));

      setReceipts(receiptsWithEmail);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment receipts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReceiptStatus = async (receiptId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({
          verification_status: status,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', receiptId);

      if (error) throw error;

      // If approved, also update the subscription status
      if (status === 'approved') {
        const receipt = receipts.find(r => r.id === receiptId);
        if (receipt) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              starts_at: new Date().toISOString()
            })
            .eq('id', receipt.subscription_id);
        }
      }

      await fetchReceipts();
      
      toast({
        title: "Status Updated",
        description: `Payment receipt ${status}`,
      });
    } catch (error) {
      console.error('Error updating receipt status:', error);
      toast({
        title: "Error",
        description: "Failed to update receipt status",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">You don't have admin privileges to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage payment receipts and subscription verifications</p>
        </motion.div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email, reference number, or payment method..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchReceipts} variant="outline">
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading receipts...</p>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payment receipts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceipts.map((receipt) => (
                  <Card key={receipt.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-lg">{receipt.user_email}</h3>
                            <Badge className={getStatusColor(receipt.verification_status)}>
                              {receipt.verification_status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Amount:</span> ₱{receipt.amount}
                            </div>
                            <div>
                              <span className="font-medium">Method:</span> {receipt.payment_method}
                            </div>
                            <div>
                              <span className="font-medium">Reference:</span> {receipt.reference_number || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {new Date(receipt.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setSelectedReceipt(receipt)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {receipt.verification_status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateReceiptStatus(receipt.id, 'approved')}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => updateReceiptStatus(receipt.id, 'rejected', 'Invalid receipt')}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Viewer Modal */}
        {selectedReceipt && (
          <ReceiptViewer
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            onStatusUpdate={updateReceiptStatus}
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
