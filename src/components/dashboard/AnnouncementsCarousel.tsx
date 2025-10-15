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
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<Registration | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  // ---------------------------
  // Load Active Events
  // ---------------------------
  const loadEvents = async () => {
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
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ---------------------------
  // Check if user already registered for the event
  // ---------------------------
  const checkExistingRegistration = async (eventId: string) => {
    if (!user) return null;
    setCheckingRegistration(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .maybeSingle();

      const userEmail = profile?.email || user.email || "";

      const { data: reg } = await supabase
        .from("event_registrations")
        .select("id, qr_code, first_name, last_name, email")
        .eq("event_id", eventId)
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
        .maybeSingle();

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
    // For webinars → open video directly
    if (event.webinar_video_url) {
      window.open(event.webinar_video_url, "_blank");
      return;
    }

    // Start modal only after registration check
    setSelectedEvent(event);
    setShowRSVPModal(true);
    await checkExistingRegistration(event.id);
  };

  const handleLearnMoreClick = (event: Event) => {
    if (event.webinar_video_url) {
      window.open(event.webinar_video_url, "_blank");
    }
  };

  const handleRSVPSuccess = () => {
    setShowRSVPModal(false);
    setSelectedEvent(null);
    setExistingRegistration(null);
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
