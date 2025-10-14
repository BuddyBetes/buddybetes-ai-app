import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

import QRScanner from '@/components/events/QRScanner';
import LiveCheckInStats from '@/components/admin/LiveCheckInStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
}

interface Attendee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  checked_in: boolean;
  checked_in_at: string | null;
  registration_type: string;
}

const EventScannerView = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    // Subscribe to realtime updates for attendee list
    const channel = supabase
      .channel('attendee-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          loadAttendees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title, event_date, location')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) throw eventError;

      if (!eventData) {
        toast({
          title: 'Event Not Found',
          description: 'The requested event could not be found',
          variant: 'destructive',
        });
        navigate('/admin/events');
        return;
      }

      setEvent(eventData);
      await loadAttendees();
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttendees = async () => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('last_name', { ascending: true });

      if (error) throw error;

      setAttendees(data || []);
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/events')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          {event.event_date && (
            <p className="text-muted-foreground text-sm">{format(new Date(event.event_date), 'PPP p')}</p>
          )}
          {event.location && (
            <p className="text-muted-foreground text-sm">{event.location}</p>
          )}
        </div>
      </div>

      <LiveCheckInStats eventId={eventId!} />

      <Tabs defaultValue="scanner" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <QRScanner eventId={eventId} onScanSuccess={loadAttendees} />
        </TabsContent>

        <TabsContent value="attendees">
          <Card>
            <CardHeader>
              <CardTitle>Attendee List</CardTitle>
            </CardHeader>
            <CardContent>
              {attendees.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No registrations yet
                </p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {attendee.first_name} {attendee.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                        {attendee.checked_in && attendee.checked_in_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Checked in at {format(new Date(attendee.checked_in_at), 'p')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={attendee.registration_type === 'in_person' ? 'default' : 'secondary'}>
                          {attendee.registration_type}
                        </Badge>
                        {attendee.checked_in ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventScannerView;
