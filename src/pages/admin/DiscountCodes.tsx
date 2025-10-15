import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DiscountCodeDialog from '@/components/admin/DiscountCodeDialog';
import { DiscountCodeFormData } from '@/components/admin/DiscountCodeForm';
import type { DiscountCode } from '@/types/discountCodes';
import { format } from 'date-fns';

const DiscountCodes = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error loading discount codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load discount codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: DiscountCodeFormData) => {
    try {
      setSubmitting(true);
      
      if (editingCode) {
        const { error } = await supabase
          .from('discount_codes')
          .update(data)
          .eq('id', editingCode.id);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Discount code updated' });
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert([data]);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Discount code created' });
      }
      
      setDialogOpen(false);
      setEditingCode(null);
      loadCodes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save discount code',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Discount Codes</h1>
          <p className="text-muted-foreground">Manage discount codes and view redemptions</p>
        </div>
        <Button onClick={() => { setEditingCode(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Code
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {codes.map((code) => (
            <Card key={code.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-mono">{code.code}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {code.discount_percentage}% off
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={code.is_active ? 'default' : 'secondary'}>
                      {code.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingCode(code); setDialogOpen(true); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">
                      {code.current_uses} / {code.max_uses || '∞'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {code.duration_days ? `${code.duration_days} days` : 'Permanent'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">
                      {code.expires_at ? format(new Date(code.expires_at), 'PP') : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(code.created_at), 'PP')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DiscountCodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={editingCode || undefined}
        title={editingCode ? 'Edit Discount Code' : 'Create Discount Code'}
        isLoading={submitting}
      />
    </div>
  );
};

export default DiscountCodes;
