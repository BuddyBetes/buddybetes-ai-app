import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import InlineRSVPForm from "@/components/events/InlineRSVPForm";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  video_url: string | null;
  subtitle: string | null;
  badge: string | null;
  image_url: string | null;
  color_gradient: string | null;
}

const AnnouncementsCarousel = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRSVPForm, setShowRSVPForm] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const handleShowInterest = (event: Event) => {
    setSelectedEvent(event);
    setShowRSVPForm(true);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying || events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length]);

  useEffect(() => {
    if (selectedEvent) {
      setIsAutoPlaying(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEvent) return;
      if (e.key === "ArrowLeft") {
        prevSlide();
        setIsAutoPlaying(false);
      } else if (e.key === "ArrowRight") {
        nextSlide();
        setIsAutoPlaying(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, events.length]);

  if (events.length === 0) return null;

  const currentEvent = events[currentSlide];

  return (
    <section className="w-full rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
      {/* Header */}
      <div className="text-center py-5 px-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="inline-flex items-center gap-2 text-primary font-medium mb-1">
          <Bell className="h-4 w-4" />
          <span className="text-sm uppercase tracking-wide">What's New</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Latest Updates & Events</h2>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden rounded-none">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {events.map((event) => (
              <div key={event.id} className="min-w-full">
                <div className="relative h-52 md:h-64">
                  {/* Image with darker overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
                  </div>

                  {/* Text content */}
                  <div className="relative h-full flex items-end px-6 pb-6 text-white">
                    <div className="w-full max-w-2xl">
                      <Badge className="mb-2 bg-white/20 text-xs font-semibold border border-white/40">
                        {event.badge || "Upcoming Event"}
                      </Badge>
                      <h3 className="text-2xl font-bold mb-1 drop-shadow">{event.title}</h3>
                      {event.subtitle && <p className="text-sm mb-2 text-gray-200">{event.subtitle}</p>}
                      <p className="text-sm line-clamp-2 text-gray-300 mb-3">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => handleShowInterest(event)}
                          className="bg-primary text-white hover:bg-primary/90 text-sm h-8 px-4"
                        >
                          Register Now
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => setSelectedEvent(event)}
                          variant="outline"
                          className="bg-white/10 text-white border-white/40 hover:bg-white/20 text-sm h-8 px-4"
                        >
                          Learn More
                        </Button>
                        <div className="flex items-center gap-1.5 text-xs text-gray-200 ml-2">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(event.event_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        {events.length > 1 && (
          <>
            <button
              onClick={() => {
                prevSlide();
                setIsAutoPlaying(false);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white shadow-md transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white shadow-md transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {events.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentSlide ? "w-5 bg-primary" : "w-2 bg-gray-400 hover:bg-gray-600"
                } h-2 rounded-full`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && !showRSVPForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full animate-scale-in overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-primary/10 text-primary font-medium">{selectedEvent.badge || "Event"}</Badge>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="hover:bg-muted p-2 rounded-full transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className="h-40 rounded-lg mb-4 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${selectedEvent.image_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20"></div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">{selectedEvent.title}</h3>
              {selectedEvent.subtitle && <p className="text-lg text-muted-foreground mb-3">{selectedEvent.subtitle}</p>}
              <p className="text-muted-foreground mb-4 leading-relaxed">{selectedEvent.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(selectedEvent.event_date), "PPP p")}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleShowInterest(selectedEvent)}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RSVP Form */}
      {showRSVPForm && selectedEvent && user && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full animate-scale-in overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Register for {selectedEvent.title}</h3>
                <button
                  onClick={() => {
                    setShowRSVPForm(false);
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="hover:bg-muted p-2 rounded-full transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <InlineRSVPForm
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onSuccess={() => {
                  setShowRSVPForm(false);
                  setSelectedEvent(null);
                  setIsAutoPlaying(true);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};

export default AnnouncementsCarousel;
