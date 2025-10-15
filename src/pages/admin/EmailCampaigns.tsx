import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Send, Loader2, Users, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Campaign {
  id: string;
  campaign_name: string;
  subject: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  completed_at?: string;
}

interface Recipient {
  id: string;
  email: string;
  status: string;
  sent_at?: string;
  error_message?: string;
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSendConfirmDialog, setShowSendConfirmDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadCampaigns();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('campaign-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'email_campaigns'
      }, () => {
        loadCampaigns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || !subject.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('email_campaigns').insert({
        created_by: user?.id,
        campaign_name: campaignName,
        subject,
        email_type: 'marketing',
        template_html: 'buddybetes-promo',
        status: 'draft',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });

      setCampaignName('');
      setSubject('');
      setShowCreateDialog(false);
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsDialog(true);
    setLoadingRecipients(true);

    try {
      const { data, error } = await supabase
        .from('email_campaign_recipients')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipients',
        variant: 'destructive',
      });
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaign) return;

    setSending(true);
    setShowSendConfirmDialog(false);

    try {
      const { error } = await supabase.functions.invoke('send-email-blast', {
        body: { campaignId: selectedCampaign.id },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Campaign is being sent',
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to send campaign',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      sending: { color: 'bg-blue-100 text-blue-700', label: 'Sending' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
    };

    const variant = variants[status] || variants.draft;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'sending').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    successRate: campaigns.length > 0
      ? Math.round((campaigns.reduce((sum, c) => sum + c.sent_count, 0) / 
          Math.max(campaigns.reduce((sum, c) => sum + c.recipient_count, 0), 1)) * 100)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage promotional email campaigns</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-buddy-500 hover:bg-buddy-600">
          <Mail className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Campaigns"
          value={stats.total}
          icon={<Mail className="h-5 w-5 text-buddy-600" />}
          color="bg-buddy-100"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatsCard
          title="Total Sent"
          value={stats.totalSent}
          icon={<Send className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-100"
        />
      </div>

      {/* Campaigns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No campaigns yet. Create your first campaign to get started.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    {campaign.sent_count}/{campaign.recipient_count}
                  </TableCell>
                  <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(campaign)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowSendConfirmDialog(true);
                          }}
                          className="border-buddy-300 text-buddy-700 hover:bg-buddy-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new email campaign to send to all users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Spring 2025 Promo"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Take Control of Your Diabetes Journey"
                className="mt-1"
              />
            </div>
            <div className="bg-buddy-50 border border-buddy-200 rounded-lg p-4">
              <p className="text-sm text-buddy-900 font-medium">Template</p>
              <p className="text-sm text-buddy-700 mt-1">
                BuddyBetes Promotional Email (featuring app benefits, AI insights, and photo analysis)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={creating} className="bg-buddy-500 hover:bg-buddy-600">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.campaign_name}</DialogTitle>
            <DialogDescription>Campaign Details & Recipients</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium mt-1">{selectedCampaign && getStatusBadge(selectedCampaign.status)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium mt-1">{selectedCampaign?.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="font-medium mt-1">{selectedCampaign?.recipient_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="font-medium mt-1">
                  {selectedCampaign?.sent_count || 0} / {selectedCampaign?.recipient_count || 0}
                </p>
              </div>
            </div>

            {loadingRecipients ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div>
                <h4 className="font-medium mb-2">Recipients</h4>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipients.map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell className="font-mono text-sm">{recipient.email}</TableCell>
                          <TableCell>
                            {recipient.status === 'sent' && (
                              <Badge className="bg-green-100 text-green-700">Sent</Badge>
                            )}
                            {recipient.status === 'failed' && (
                              <Badge className="bg-red-100 text-red-700">Failed</Badge>
                            )}
                            {recipient.status === 'pending' && (
                              <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={showSendConfirmDialog} onOpenChange={setShowSendConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send "{selectedCampaign?.subject}" to all users in the profiles database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendCampaign}
              disabled={sending}
              className="bg-buddy-500 hover:bg-buddy-600"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailCampaigns;
