import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Bell, Loader2 } from "lucide-react";
import { format } from "date-fns";
import InlineRSVPForm from "@/components/events/InlineRSVPForm";
import { Badge } from "@/components/ui/badge";
import QRCodeDisplay from "@/components/events/QRCodeDisplay";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  location?: string;
  gradient?: string;
  badge?: string;
  webinar_video_url?: string;
}

interface Registration {
  id: string;
  qr_code: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AnnouncementsCarousel = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [existingRegistration, setExistingRegistration] = useState<Registration | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [registrationStatuses, setRegistrationStatuses] = useState<Record<string, Registration | null>>({});
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Setup carousel event listeners
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // ---------------------------
  // Load Active Events
  // ---------------------------
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Check registration status for all events when events load or user changes
  useEffect(() => {
    if (events.length > 0 && user) {
      checkAllRegistrations();
    } else {
      setLoadingStatuses(false);
    }
  }, [events, user]);

  // Check registration status for ALL events
  const checkAllRegistrations = async () => {
    if (!user || events.length === 0) {
      setLoadingStatuses(false);
      return;
    }

    setLoadingStatuses(true);
    const statuses: Record<string, Registration | null> = {};

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .maybeSingle();

      const userEmail = profile?.email || user.email || "";

      for (const event of events) {
        const { data: reg, error } = await supabase
          .from("event_registrations")
          .select("id, qr_code, first_name, last_name, email")
          .eq("event_id", event.id)
          .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
          .maybeSingle();

        if (!error && reg) {
          statuses[event.id] = reg;
        } else {
          statuses[event.id] = null;
        }
      }

      setRegistrationStatuses(statuses);
    } catch (error) {
      console.error("Error checking registrations:", error);
    } finally {
      setLoadingStatuses(false);
    }
  };

  // ---------------------------
  // Check if user already registered for the event
  // ---------------------------
  const checkExistingRegistration = async (eventId: string): Promise<Registration | null> => {
    if (!user) return null;
    setCheckingRegistration(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .maybeSingle();

      const userEmail = profile?.email || user.email || "";

      const { data: reg, error } = await supabase
        .from("event_registrations")
        .select("id, qr_code, first_name, last_name, email")
        .eq("event_id", eventId)
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      setExistingRegistration(reg || null);
      return reg || null;
    } catch (error) {
      console.error("Error checking registration:", error);
      setExistingRegistration(null);
      return null;
    } finally {
      setCheckingRegistration(false);
    }
  };

  // ---------------------------
  // When "Register Now" button is clicked
  // ---------------------------
  const handleRegisterClick = async (event: Event) => {
    if (event.webinar_video_url) {
      window.open(event.webinar_video_url, "_blank");
      return;
    }

    if (!user) {
      alert("Please log in to register for this event.");
      return;
    }

    // Open dialog - will show registration form since no existing registration
    setSelectedEvent(event);
    setExistingRegistration(null);
  };

  const handleShowQRCode = (event: Event, registration: Registration) => {
    setSelectedEvent(event);
    setExistingRegistration(registration);
  };

  const handleLearnMoreClick = (event: Event) => {
    if (event.webinar_video_url) {
      window.open(event.webinar_video_url, "_blank");
    }
  };

  const handleRSVPSuccess = async () => {
    if (selectedEvent) {
      const reg = await checkExistingRegistration(selectedEvent.id);
      setExistingRegistration(reg);
      // Update the statuses state
      if (reg) {
        setRegistrationStatuses(prev => ({
          ...prev,
          [selectedEvent.id]: reg
        }));
      }
    }
  };

  if (loadingEvents) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="p-6 rounded-xl bg-white shadow-sm">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <Badge variant="secondary" className="mb-2 bg-buddy-100 text-buddy-700 border border-buddy-200">
            <Bell className="h-3 w-3 mr-1" />
            What's New
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">Latest Updates & Events</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Stay informed about upcoming events and new features
          </p>
        </div>

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {events.map((event) => (
              <div key={event.id} className="flex-[0_0_100%] min-w-0 px-2">
                <Card className="overflow-hidden border border-buddy-100 bg-gradient-to-br from-white to-buddy-50/30 hover:shadow-lg transition-shadow">
                  <CardContent className={`p-6 ${event.gradient || ""}`}>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {event.badge && (
                          <Badge variant="secondary" className="text-xs bg-buddy-100 text-buddy-700 border-buddy-200">
                            {event.badge}
                          </Badge>
                        )}
                        <h3 className="text-xl sm:text-2xl font-bold">{event.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">{event.description}</p>
                      </div>

                      <div className="space-y-3">
                        {loadingStatuses ? (
                          <Button
                            disabled
                            className="w-full h-14 text-base bg-buddy-500 hover:bg-buddy-600"
                            size="lg"
                          >
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </Button>
                        ) : registrationStatuses[event.id] ? (
                          <Button
                            onClick={() => handleShowQRCode(event, registrationStatuses[event.id]!)}
                            className="w-full h-14 text-base bg-green-600 hover:bg-green-700"
                            size="lg"
                          >
                            Show QR Code
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleRegisterClick(event)}
                            className="w-full h-14 text-base bg-buddy-500 hover:bg-buddy-600"
                            size="lg"
                          >
                            {event.webinar_video_url ? "Watch Now" : "Register Now"}
                          </Button>
                        )}

                        {event.webinar_video_url && (
                          <Button
                            variant="outline"
                            onClick={() => handleLearnMoreClick(event)}
                            className="w-full h-14 text-base border-buddy-300 text-buddy-700 hover:bg-buddy-50"
                            size="lg"
                          >
                            Learn More
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground pt-2">
                        {event.event_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(event.event_date), "PPP")}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        {events.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === selectedIndex 
                    ? "w-8 bg-buddy-500" 
                    : "w-2 bg-buddy-200 hover:bg-buddy-300"
                )}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* RSVP / QR Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{existingRegistration ? "Your Event QR Code" : "Event Registration"}</DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {checkingRegistration ? (
              <div className="flex justify-center items-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Checking registration...
              </div>
            ) : selectedEvent && existingRegistration ? (
              <QRCodeDisplay
                qrCode={existingRegistration.qr_code}
                eventTitle={selectedEvent.title}
                userName={`${existingRegistration.first_name} ${existingRegistration.last_name}`}
              />
            ) : selectedEvent ? (
              <InlineRSVPForm
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onSuccess={handleRSVPSuccess}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AnnouncementsCarousel;
