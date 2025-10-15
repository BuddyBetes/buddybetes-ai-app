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
import QRCodeDisplay from "@/components/events/QRCodeDisplay";

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
  const [existingRegistration, setExistingRegistration] = useState<any>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, date, image_url")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEventClick = async (event: Event) => {
    if (!user) return;

    setIsCheckingRegistration(true);
    setSelectedEvent(null);
    setExistingRegistration(null);

    try {
      // ✅ Check if user already registered for this event
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setExistingRegistration(data);
      } else {
        setExistingRegistration(null);
      }

      // ✅ Only open modal after check completes
      setSelectedEvent(event);
    } catch (err) {
      console.error("Error checking registration:", err);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleRSVPSuccess = () => {
    // Re-fetch registration entry after successful RSVP
    if (selectedEvent && user) {
      handleEventClick(selectedEvent);
    }
  };

  if (events.length === 0) return null;

  return (
    <section className="w-full px-4 py-6">
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

      {/* Event Cards */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className={`p-6 ${event.gradient || ""}`}>
              <div className="space-y-4">
                <div className="space-y-3">
                  {event.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {event.badge}
                    </Badge>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold">{event.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{event.description}</p>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => handleRegisterClick(event)} className="w-full h-14 text-base" size="lg">
                    {event.webinar_video_url ? "Watch Now" : "Register Now"}
                  </Button>

                  {event.webinar_video_url && (
                    <Button
                      variant="outline"
                      onClick={() => handleLearnMoreClick(event)}
                      className="w-full h-14 text-base"
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
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showRSVPModal} onOpenChange={setShowRSVPModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{existingRegistration ? "Your Event QR Code" : "Event Registration"}</DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {checkingRegistration ? (
              <div className="flex justify-center items-center py-8 text-muted-foreground">
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
                existingRegistration={existingRegistration} // 👈 NEW PROP
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
