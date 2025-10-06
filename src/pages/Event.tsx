import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EventRSVPForm from '@/components/events/EventRSVPForm';
import EventVideoSection from '@/components/events/EventVideoSection';
import QRCodeDisplay from '@/components/events/QRCodeDisplay';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  video_url: string | null;
  max_attendees: number | null;
}

const Event = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userQrCode, setUserQrCode] = useState<string | null>(null);

  useEffect(() => {
    loadEvent();
    if (user) {
      checkRegistration();
    }
  }, [eventId, user]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    if (!user || !eventId) return;

    try {
      const { data } = await supabase
        .from('event_registrations')
        .select('id, qr_code')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setIsRegistered(true);
        setUserQrCode(data.qr_code);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleQuickRegister = async () => {
    if (!user || !event) return;

    setRegistering(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('event-registration', {
        body: {
          eventId: event.id,
          email: profile?.email || user.email,
          firstName: profile?.first_name || 'User',
          lastName: profile?.last_name || '',
          userId: user.id,
        },
      });

      if (error) throw error;

      setIsRegistered(true);
      setUserQrCode(data.qrCode);
      toast.success('Registration confirmed!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">This event doesn't exist or is no longer active.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{format(new Date(event.event_date), 'PPP p')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
            )}
            {event.max_attendees && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Max {event.max_attendees} attendees</span>
              </div>
            )}
          </div>

          <p className="text-lg mb-6 whitespace-pre-wrap">{event.description}</p>

          {user && !isRegistered && (
            <Button
              onClick={handleQuickRegister}
              disabled={registering}
              size="lg"
              className="w-full md:w-auto"
            >
              {registering ? 'Registering...' : 'Confirm Attendance & Get QR Code'}
            </Button>
          )}
        </Card>

        {event.video_url && <EventVideoSection videoUrl={event.video_url} />}

        {user && isRegistered && userQrCode && (
          <QRCodeDisplay 
            qrCode={userQrCode}
            eventTitle={event.title}
            userName="Your Name"
          />
        )}

        {!user && <EventRSVPForm eventId={event.id} />}
      </div>
    </div>
  );
};

export default Event;
