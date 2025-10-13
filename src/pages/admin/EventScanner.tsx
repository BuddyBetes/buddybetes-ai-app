import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import EventScannerCard from '@/components/admin/EventScannerCard';

interface Event {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  description: string;
  total_registrations: number;
  checked_in: number;
}

const EventScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access this page',
          variant: 'destructive',
        });
        navigate('/signin');
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        toast({
          title: 'Access Denied',
          description: 'Admin privileges required',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      loadEvents();
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify admin status',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);

      // Get all active events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Get registration stats for each event
      const eventsWithStats = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: registrations, error: regError } = await supabase
            .from('event_registrations')
            .select('checked_in')
            .eq('event_id', event.id);

          if (regError) throw regError;

          const total = registrations?.length || 0;
          const checkedIn = registrations?.filter(r => r.checked_in).length || 0;

          return {
            id: event.id,
            title: event.title,
            event_date: event.event_date,
            location: event.location,
            description: event.description,
            total_registrations: total,
            checked_in: checkedIn,
          };
        })
      );

      setEvents(eventsWithStats);
    } catch (error: any) {
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <QrCode className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Event QR Scanner</h1>
        </div>
        <p className="text-muted-foreground">
          Scan attendee QR codes to check them in to events
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Events</h3>
            <p className="text-muted-foreground">
              There are no active events to scan QR codes for at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventScannerCard
              key={event.id}
              event={event}
              onScan={() => navigate(`/admin/event-scanner/${event.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventScanner;
