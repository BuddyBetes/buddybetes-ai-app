import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Bell } from "lucide-react";
import { format } from "date-fns";
import InlineRSVPForm from "@/components/events/InlineRSVPForm";
import { Badge } from "@/components/ui/badge";

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

const AnnouncementsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<{
    qr_code: string;
    first_name: string;
    last_name: string;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRegisterClick = async (event: Event) => {
    if (event.webinar_video_url) {
      window.open(event.webinar_video_url, "_blank");
      return;
    }

    setSelectedEvent(event);
    setShowRSVPModal(true);
    setIsCheckingRegistration(true);
    setExistingRegistration(null);

    if (!user) {
      setIsCheckingRegistration(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("qr_code, first_name, last_name")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingRegistration(data);
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleRSVPSuccess = (registrationData: { qrCode: string; firstName: string; lastName: string }) => {
    setExistingRegistration({
      qr_code: registrationData.qrCode,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
    });
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const newIndex = Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth);
      setCurrentIndex(newIndex);
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-6 font-sans">
      <div className="text-center mb-6 space-y-2">
        <Badge variant="secondary" className="mb-2">
          <Bell className="h-3 w-3 mr-1" />
          What's New
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold">Latest Updates & Events</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Stay informed about upcoming events and new features
        </p>
      </div>

      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {events.map((event) => (
          <div key={event.id} className="w-full flex-shrink-0 snap-center px-2">
            <Card className="overflow-hidden h-full flex flex-col">
              <CardContent className={`p-6 ${event.gradient || ""} flex-grow flex flex-col`}>
                <div className="space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    {event.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {event.badge}
                      </Badge>
                    )}
                    <h3 className="text-xl sm:text-2xl font-bold">{event.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{event.description}</p>
                  </div>

                  <div>
                    <div className="space-y-3 mt-4">
                      <Button onClick={() => handleRegisterClick(event)} className="w-full h-14 text-base" size="lg">
                        {event.webinar_video_url ? "Watch Now" : "Register Now"}
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground pt-4">
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
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-2 mt-6">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.scrollTo({
                  left: carouselRef.current.offsetWidth * index,
                  behavior: "smooth",
                });
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? "w-5 bg-primary" : "w-2 bg-muted-foreground/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <Dialog open={showRSVPModal} onOpenChange={setShowRSVPModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Registration</DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isCheckingRegistration ? (
              <div className="flex items-center justify-center py-8 h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : existingRegistration ? (
              <QRCodeDisplay
                qrCode={existingRegistration.qr_code}
                eventTitle={selectedEvent?.title || ""}
                userName={`${existingRegistration.first_name} ${existingRegistration.last_name}`}
              />
            ) : (
              selectedEvent && (
                <InlineRSVPForm
                  eventId={selectedEvent.id}
                  eventTitle={selectedEvent.title}
                  onSuccess={handleRSVPSuccess}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AnnouncementsCarousel;
