import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin, Users, QrCode, Loader2 } from 'lucide-react';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import AppHeader from '@/components/AppHeader';

interface Event {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  description: string;
  total_registrations: number;
  checked_in: number;
}

const EventDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();

    // Subscribe to realtime updates for event registrations
    const channel = supabase
      .channel('event-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations'
        },
        () => {
          console.log('Registration updated, reloading events...');
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      const eventsWithStats = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: registrations } = await supabase
            .from('event_registrations')
            .select('checked_in')
            .eq('event_id', event.id);

          const total_registrations = registrations?.length || 0;
          const checked_in = registrations?.filter((r) => r.checked_in).length || 0;

          return {
            id: event.id,
            title: event.title,
            event_date: event.event_date,
            location: event.location,
            description: event.description,
            total_registrations,
            checked_in,
          };
        })
      );

      setEvents(eventsWithStats);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (eventDate: string | null) => {
    if (!eventDate) return null;
    
    const date = new Date(eventDate);
    
    if (isToday(date)) {
      return <Badge className="bg-green-500">Happening Now</Badge>;
    } else if (isPast(date)) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (isFuture(date)) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    return null;
  };

  const getProgressPercentage = (checkedIn: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((checkedIn / total) * 100);
  };

  return (
    <Layout>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Management</h1>
          <p className="text-muted-foreground">
            Manage events and scan QR codes for check-ins
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Active Events</h2>
              <p className="text-muted-foreground">
                There are no active events at the moment.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => {
              const progress = getProgressPercentage(event.checked_in, event.total_registrations);

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="text-xl font-semibold leading-tight">
                          {event.title}
                        </h3>
                        {getStatusBadge(event.event_date)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      {event.event_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.event_date), 'PPP p')}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Check-in Progress</span>
                        <span className="font-medium">
                          {event.checked_in} / {event.total_registrations}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {progress}% checked in
                      </p>
                    </div>

                    <Button
                      onClick={() => navigate(`/admin/events/scan/${event.id}`)}
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan QR Codes
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventDashboard;
