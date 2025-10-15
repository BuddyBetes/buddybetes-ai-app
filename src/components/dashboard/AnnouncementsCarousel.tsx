import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import InlineRSVPForm from "@/components/InlineRSVPForm";
import { Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center sm:text-left">Upcoming Events</h2>

      {loadingEvents ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground">No upcoming events.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              {event.image_url && (
                <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              <p className="text-xs text-muted-foreground mt-2">📅 {new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                {existingRegistration
                  ? "You're already registered for this event."
                  : "Fill out the form to register for this event."}
              </DialogDescription>
            </DialogHeader>

            {isCheckingRegistration ? (
              <div className="flex justify-center items-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Checking registration...</span>
              </div>
            ) : existingRegistration ? (
              <QRCodeDisplay
                qrCode={existingRegistration.qr_code}
                eventTitle={selectedEvent.title}
                userName={`${existingRegistration.first_name} ${existingRegistration.last_name}`}
              />
            ) : (
              <InlineRSVPForm
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onSuccess={handleRSVPSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AnnouncementsCarousel;
