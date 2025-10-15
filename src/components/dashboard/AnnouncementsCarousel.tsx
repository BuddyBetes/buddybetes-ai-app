import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, ExternalLink, Bell } from 'lucide-react';
import InlineRSVPForm from '@/components/events/InlineRSVPForm';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';

const STATIC_WEBINAR_ID = '22222222-2222-2222-2222-222222222222';

interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  event_date: string | null;
  location?: string;
  image_url?: string;
  video_url?: string;
  color_gradient?: string;
  max_attendees?: number;
}

type ModalType = 'none' | 'details' | 'register' | 'qr';

const AnnouncementsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalType, setModalType] = useState<ModalType>('none');
  const [eventRegistrations, setEventRegistrations] = useState<Map<string, { qrCode: string; firstName: string; lastName: string }>>(new Map());
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);
  const { user } = useAuth();

  const loadUserRegistrations = async () => {
    if (!user) return;
    
    try {
      const userEmail = user.email || '';
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('event_id, qr_code, first_name, last_name')
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`);
      
      if (error) throw error;
      
      if (registrations) {
        const regMap = new Map();
        registrations.forEach(reg => {
          regMap.set(reg.event_id, {
            qrCode: reg.qr_code,
            firstName: reg.first_name,
            lastName: reg.last_name
          });
        });
        setEventRegistrations(regMap);
      }
    } catch (error) {
      console.error('Error loading user registrations:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserRegistrations();
    }
  }, [user]);

  const handleRegisterClick = (event: Event) => {
    // For webinar, open video directly
    if (event.id === STATIC_WEBINAR_ID && event.video_url) {
      window.open(event.video_url, '_blank');
      return;
    }

    setSelectedEvent(event);
    const registration = eventRegistrations.get(event.id);
    
    if (registration) {
      // User already registered - show QR code immediately
      setQrCode(registration.qrCode);
      setUserData({ firstName: registration.firstName, lastName: registration.lastName });
      setModalType('qr');
    } else {
      // User not registered - show registration form
      setQrCode(null);
      setUserData(null);
      setModalType('register');
    }
  };

  const handleLearnMoreClick = (event: Event) => {
    setSelectedEvent(event);
    
    if (event.video_url && event.id === STATIC_WEBINAR_ID) {
      window.open(event.video_url, '_blank');
    } else {
      setModalType('details');
    }
  };

  const handleRSVPSuccess = () => {
    loadUserRegistrations();
    setModalType('none');
    setSelectedEvent(null);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setModalType('none');
    setQrCode(null);
    setUserData(null);
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6 max-w-md mx-auto">
        <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-sm font-medium px-3 py-1.5 rounded-full mb-3">
          <Bell className="h-4 w-4" />
          What's New
        </div>
        <h2 className="text-2xl font-bold">Latest Updates & Events</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Stay informed about new features, upcoming events, and community activities
        </p>
      </div>

      {/* Vertical Event Cards */}
      <div className="space-y-4 max-w-md mx-auto">
        {events.map((event) => {
          const isWebinar = event.id === STATIC_WEBINAR_ID;
          const isRegistered = eventRegistrations.has(event.id);
          
          // Define gradient
          let gradientStyle = event.color_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          if (isWebinar && !event.color_gradient) {
            gradientStyle = 'linear-gradient(135deg, #165e5e 0%, #208687 100%)';
          }
          
          return (
            <Card key={event.id} className="overflow-hidden">
              <CardContent 
                className="p-6 text-white flex flex-col"
                style={{ background: gradientStyle }}
              >
                {/* Badge */}
                {event.badge && (
                  <Badge className="self-start bg-white/20 text-white border-white/30 mb-3 hover:bg-white/30">
                    {event.badge}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>

                {/* Subtitle */}
                {event.subtitle && (
                  <p className="text-sm opacity-90 mb-2">{event.subtitle}</p>
                )}

                {/* Description */}
                <p className="text-sm opacity-90 leading-relaxed mb-4 flex-grow">
                  {event.description}
                </p>

                {/* Buttons - Stack vertically */}
                <div className="space-y-3 mb-4">
                  <Button
                    onClick={() => handleRegisterClick(event)}
                    className="w-full h-14 text-base font-semibold bg-white text-primary hover:bg-white/90"
                  >
                    {isWebinar ? 'Watch Now' : isRegistered ? 'View QR Code' : 'Register Now'}
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => handleLearnMoreClick(event)}
                    variant="outline"
                    className="w-full h-14 bg-transparent border-white/50 text-white hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </div>

                {/* Event Info */}
                <div className="flex flex-wrap gap-3 text-xs opacity-80">
                  {event.event_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.max_attendees && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>Max {event.max_attendees}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for Event Details / Registration / QR Code */}
      <Dialog open={modalType !== 'none'} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {modalType === 'qr' && qrCode && userData ? (
            <div className="text-center space-y-4 p-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Registration Confirmed! 🎉</h3>
                <p className="text-muted-foreground text-sm">
                  Welcome, {userData.firstName} {userData.lastName}!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl inline-block mx-auto shadow-lg">
                <QRCodeSVG
                  value={qrCode}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Show this QR code at the event for check-in
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 Check your email for the QR code PNG attachment
                </p>
              </div>
              
              <Button onClick={handleCloseModal} className="w-full">
                Close
              </Button>
            </div>
          ) : modalType === 'register' && selectedEvent ? (
            <InlineRSVPForm
              eventId={selectedEvent.id}
              eventTitle={selectedEvent.title}
              onSuccess={handleRSVPSuccess}
            />
          ) : modalType === 'details' && selectedEvent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              
              {selectedEvent.event_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedEvent.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              <Button 
                className="w-full h-14 text-base"
                onClick={() => setModalType('register')}
              >
                Register Now
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AnnouncementsCarousel;
