
import React, { useState, useEffect } from 'react';
import { X, Check, Ban, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  rejection_reason?: string | null;
}

interface ReceiptViewerProps {
  receipt: PaymentReceipt;
  onClose: () => void;
  onStatusUpdate: (receiptId: string, status: 'approved' | 'rejected', reason?: string) => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ receipt, onClose, onStatusUpdate }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReceiptImage();
  }, [receipt]);

  const loadReceiptImage = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .createSignedUrl(receipt.receipt_url, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      setImageUrl(data.signedUrl);
    } catch (error) {
      console.error('Error loading receipt image:', error);
      toast({
        title: "Error",
        description: "Failed to load receipt image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    }
  };

  const handleApprove = () => {
    onStatusUpdate(receipt.id, 'approved');
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    onStatusUpdate(receipt.id, 'rejected', rejectionReason);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Receipt Details</span>
            <Badge className={getStatusColor(receipt.verification_status)}>
              {receipt.verification_status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Receipt Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Receipt Image</h3>
              {imageUrl && (
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Loading receipt image...</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Payment Receipt"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Failed to load receipt image</p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">User Email</Label>
                    <p className="text-sm">{receipt.user_email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Amount</Label>
                    <p className="text-sm font-semibold">₱{receipt.amount}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                    <p className="text-sm capitalize">{receipt.payment_method}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reference Number</Label>
                    <p className="text-sm">{receipt.reference_number || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Submitted Date</Label>
                  <p className="text-sm">{new Date(receipt.created_at).toLocaleString()}</p>
                </div>

                {receipt.rejection_reason && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Rejection Reason</Label>
                    <p className="text-sm text-red-600">{receipt.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {receipt.verification_status === 'pending' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
                  <Button 
                    onClick={handleReject}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;
