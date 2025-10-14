import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Mail, MailX, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  checked_in: boolean;
  checked_in_at: string | null;
  email_sent: boolean;
  created_at: string;
  qr_code: string;
}

interface EventRegistrationListProps {
  eventId: string;
}

const EventRegistrationList: React.FC<EventRegistrationListProps> = ({ eventId }) => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'checked-in' | 'not-checked-in'>('all');

  useEffect(() => {
    loadRegistrations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('event-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          loadRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error('Error loading registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ checked_in: true })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Attendee checked in manually',
      });
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in attendee',
        variant: 'destructive',
      });
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'checked-in' && reg.checked_in) ||
      (filter === 'not-checked-in' && !reg.checked_in);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: registrations.length,
    checkedIn: registrations.filter((r) => r.checked_in).length,
    notCheckedIn: registrations.filter((r) => !r.checked_in).length,
    emailSent: registrations.filter((r) => r.email_sent).length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading registrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Event Registrations</CardTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
          <div className="text-center p-2.5 sm:p-3 bg-muted rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-green-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Checked In</div>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-orange-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.notCheckedIn}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-blue-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.emailSent}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Email Sent</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 sm:h-10 text-[16px] sm:text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1 sm:flex-none h-11 sm:h-9 touch-manipulation text-sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'checked-in' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('checked-in')}
              className="flex-1 sm:flex-none h-11 sm:h-9 touch-manipulation text-sm"
            >
              Checked In
            </Button>
            <Button
              variant={filter === 'not-checked-in' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('not-checked-in')}
              className="flex-1 sm:flex-none h-11 sm:h-9 touch-manipulation text-sm"
            >
              Pending
            </Button>
          </div>
        </div>

        {/* Registration List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
              No registrations found
            </div>
          ) : (
            filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition gap-2 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {reg.first_name} {reg.last_name}
                    </p>
                    {reg.checked_in && (
                      <Badge variant="default" className="bg-green-600 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span className="text-xs">Checked In</span>
                      </Badge>
                    )}
                    {reg.email_sent ? (
                      <span title="Email sent" className="flex-shrink-0">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </span>
                    ) : (
                      <span title="Email not sent" className="flex-shrink-0">
                        <MailX className="h-4 w-4 text-gray-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{reg.email}</p>
                  {reg.checked_in_at && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Checked in: {format(new Date(reg.checked_in_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>
                {!reg.checked_in && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleManualCheckIn(reg.id)}
                    className="w-full sm:w-auto sm:ml-3 flex-shrink-0 h-10 sm:h-9 touch-manipulation"
                  >
                    Check In
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventRegistrationList;
