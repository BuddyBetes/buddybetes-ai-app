import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import QRScanner from '@/components/events/QRScanner';
import LiveCheckInStats from '@/components/admin/LiveCheckInStats';
import Layout from '@/components/Layout';
import AppHeader from '@/components/AppHeader';
import { format } from 'date-fns';

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
      <Layout>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!event) return null;

  return (
    <Layout>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/events')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <div className="text-muted-foreground space-y-1">
          {event.event_date && (
            <p>{format(new Date(event.event_date), 'PPP p')}</p>
          )}
          {event.location && <p>{event.location}</p>}
        </div>
      </div>

      <div className="mb-6">
        <LiveCheckInStats eventId={eventId!} />
      </div>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="mt-6">
          <QRScanner eventId={eventId} onScanSuccess={loadAttendees} />
        </TabsContent>

        <TabsContent value="attendees" className="mt-6">
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
                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {attendee.first_name} {attendee.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attendee.email}
                        </p>
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
    </Layout>
  );
};

export default EventScannerView;
