import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import InlineRSVPForm from "@/components/events/InlineRSVPForm";
import { useSwipe } from "@/hooks/useSwipe";

const STATIC_WEBINAR_ID = '22222222-2222-2222-2222-222222222222';
const FACEBOOK_WEBINAR_URL = 'https://www.facebook.com/buddybetes';

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      nextSlide();
      setIsAutoPlaying(false);
    },
    onSwipeRight: () => {
      prevSlide();
      setIsAutoPlaying(false);
    },
  });

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
      <div className="text-center py-4 sm:py-5 md:py-6 px-4 sm:px-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="inline-flex items-center gap-2 bg-[#208687]/10 text-[#208687] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-2 sm:mb-3 md:mb-4">
          <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-medium">What's New</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
          Latest Updates & Events
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
          Stay informed about new features, upcoming events, and community activities
        </p>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div 
          className="overflow-hidden rounded-none"
          ref={carouselRef}
          {...swipeHandlers}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {events.map((event) => (
              <div key={event.id} className="min-w-full">
                <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]">
                  {/* Background Image with Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${event.image_url})`,
                    }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${event.color_gradient || 'from-[#208687]/90 via-teal-500/90 to-cyan-600/90'} opacity-90`}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex items-center px-4 sm:px-6 md:px-10 lg:px-16">
                    <div className="max-w-2xl text-white">
                      <Badge className="mb-2 sm:mb-3 md:mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                        {event.badge || "Upcoming Event"}
                      </Badge>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
                        {event.title}
                      </h3>
                      {event.subtitle && (
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mb-3 sm:mb-4 text-white/90">
                          {event.subtitle}
                        </p>
                      )}
                      <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6 text-white/80 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4">
                        <Button
                          onClick={() => {
                            if (event.id === STATIC_WEBINAR_ID) {
                              window.open(FACEBOOK_WEBINAR_URL, '_blank');
                            } else {
                              handleShowInterest(event);
                            }
                          }}
                          className="w-full sm:w-auto bg-white text-[#208687] hover:bg-white/90 font-semibold text-sm sm:text-base"
                        >
                          {event.id === STATIC_WEBINAR_ID ? "Watch Now" : "Register Now"}
                          <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          onClick={() => setSelectedEvent(event)}
                          variant="outline"
                          className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:text-white text-sm sm:text-base"
                        >
                          Learn More
                        </Button>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-white/80 w-full sm:w-auto">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">
                            {event.id === STATIC_WEBINAR_ID 
                              ? "Every Wednesday" 
                              : format(new Date(event.event_date), "MMM d, yyyy")}
                          </span>
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-800" />
            </button>
            <button
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Dots */}
        {events.length > 1 && (
          <div className="flex justify-center gap-1.5 sm:gap-2 py-4 sm:py-3 bg-white">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentSlide ? "w-6 sm:w-8 bg-[#208687]" : "w-2 bg-muted hover:bg-muted-foreground/50"
                } h-1.5 sm:h-2 rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && !showRSVPForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
          <Card className="max-w-[92vw] sm:max-w-lg md:max-w-2xl w-full mx-2 sm:mx-4 rounded-t-3xl sm:rounded-xl animate-slide-in-bottom sm:animate-scale-in overflow-hidden max-h-[85vh]">
            <CardContent className="p-3 sm:p-6 h-full overflow-y-auto overscroll-contain webkit-overflow-scrolling-touch">
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex justify-between items-start mb-3 sm:mb-4 pb-3 border-b sm:border-0">
                <Badge className="bg-primary/10 text-primary font-medium">{selectedEvent.badge || "Event"}</Badge>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="hover:bg-muted p-2.5 sm:p-2 rounded-full transition flex-shrink-0 touch-manipulation"
                >
                  <X className="h-5 w-5 sm:h-4 sm:w-4" />
                </button>
              </div>
              <div
                className="h-32 sm:h-40 rounded-lg mb-4 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${selectedEvent.image_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">{selectedEvent.title}</h3>
              {selectedEvent.subtitle && <p className="text-base sm:text-lg text-muted-foreground mb-3">{selectedEvent.subtitle}</p>}
              <p className="text-muted-foreground mb-4 leading-relaxed">{selectedEvent.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="h-4 w-4" />
                <span>
                  {selectedEvent.id === STATIC_WEBINAR_ID
                    ? "Every Wednesday"
                    : format(new Date(selectedEvent.event_date), "PPP p")}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full">
                <Button
                  onClick={() => {
                    if (selectedEvent.id === STATIC_WEBINAR_ID) {
                      window.open(FACEBOOK_WEBINAR_URL, '_blank');
                    } else {
                      handleShowInterest(selectedEvent);
                    }
                  }}
                  className="bg-primary text-white hover:bg-primary/90 h-12 sm:h-10 w-full touch-manipulation"
                  size="lg"
                >
                  {selectedEvent.id === STATIC_WEBINAR_ID ? "Watch Now" : "Register Now"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="h-12 sm:h-10 w-full touch-manipulation"
                  size="lg"
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
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
          <Card className="max-w-[92vw] sm:max-w-lg w-full mx-2 sm:mx-4 rounded-t-3xl sm:rounded-xl animate-slide-in-bottom sm:animate-scale-in overflow-hidden max-h-[85vh]">
            <CardContent className="p-3 sm:p-6 h-full overflow-y-auto overscroll-contain webkit-overflow-scrolling-touch">
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex justify-between items-start mb-3 sm:mb-4 pb-3 border-b sm:border-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold pr-2">Register for {selectedEvent.title}</h3>
                <button
                  onClick={() => {
                    setShowRSVPForm(false);
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="hover:bg-muted p-2.5 sm:p-2 rounded-full transition flex-shrink-0 touch-manipulation"
                >
                  <X className="h-5 w-5 sm:h-4 sm:w-4" />
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
