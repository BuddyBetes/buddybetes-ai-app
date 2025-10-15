import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import InlineRSVPForm from "@/components/events/InlineRSVPForm";
import { QRCodeSVG } from "qrcode.react";
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
  const [eventRegistrations, setEventRegistrations] = useState<Map<string, { qrCode: string, firstName: string, lastName: string }>>(new Map());
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
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

  const loadUserRegistrations = async () => {
    if (!user) return;
    
    setLoadingRegistrations(true);
    try {
      const userEmail = user.email || "";
      const { data: registrations, error } = await supabase
        .from("event_registrations")
        .select("event_id, qr_code, first_name, last_name")
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
        console.log("Loaded user registrations:", regMap.size);
      }
    } catch (error) {
      console.error("Error loading user registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (user && events.length > 0) {
      loadUserRegistrations();
    }
  }, [user, events]);

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
    setIsAutoPlaying(false);
    
    // Check if already registered
    const registration = eventRegistrations.get(event.id);
    if (registration) {
      console.log("User already registered for this event, showing QR code");
      // Show QR code directly, skip form
      setQrCode(registration.qrCode);
      setUserData({ firstName: registration.firstName, lastName: registration.lastName });
      setShowRSVPForm(false);
    } else {
      console.log("User not registered, showing registration form");
      // Reset and show registration form
      setQrCode(null);
      setUserData(null);
      setShowRSVPForm(true);
    }
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
                          className="w-full sm:w-auto bg-white text-[#208687] hover:bg-white/90 font-semibold text-base sm:text-lg h-14 sm:h-12 px-6 sm:px-8 touch-manipulation"
                          disabled={loadingRegistrations}
                        >
                          {loadingRegistrations ? "Loading..." : (
                            event.id === STATIC_WEBINAR_ID ? "Watch Now" : 
                            eventRegistrations.has(event.id) ? "View QR Code" : "Register Now"
                          )}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => setSelectedEvent(event)}
                          variant="outline"
                          className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:text-white text-base sm:text-lg h-14 sm:h-12 px-6 sm:px-8 touch-manipulation"
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 sm:p-4 rounded-full shadow-lg transition-all hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 text-gray-800" />
            </button>
            <button
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 sm:p-4 rounded-full shadow-lg transition-all hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 text-gray-800" />
            </button>
          </>
        )}

        {/* Dots */}
        {events.length > 1 && (
          <div className="flex justify-center gap-3 py-4 bg-white">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all touch-manipulation ${
                  index === currentSlide ? "w-10 bg-[#208687]" : "w-3 bg-muted hover:bg-muted-foreground/50"
                } h-3 rounded-full min-h-[10px]`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && !showRSVPForm && !qrCode && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <Card 
            className="max-w-[95vw] sm:max-w-lg md:max-w-2xl w-full mx-0 sm:mx-4 rounded-t-3xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="relative p-4 sm:p-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation z-10"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              {selectedEvent.image_url && (
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4"
                  loading="lazy"
                />
              )}
              <CardTitle className="text-2xl sm:text-3xl pr-12">{selectedEvent.title}</CardTitle>
              {selectedEvent.subtitle && (
                <CardDescription className="text-base sm:text-lg mt-2">{selectedEvent.subtitle}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <p className="text-muted-foreground leading-relaxed text-base">
                {selectedEvent.description}
              </p>
              {selectedEvent.event_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {selectedEvent.id === STATIC_WEBINAR_ID ? (
                  <Button
                    onClick={() => window.open(selectedEvent.video_url, '_blank')}
                    className="flex-1 h-14 sm:h-12 text-base sm:text-lg font-semibold touch-manipulation"
                  >
                    Watch Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleShowInterest(selectedEvent)}
                    className="flex-1 h-14 sm:h-12 text-base sm:text-lg font-semibold touch-manipulation"
                    disabled={loadingRegistrations}
                  >
                    {loadingRegistrations ? "Loading..." : eventRegistrations.has(selectedEvent.id) ? "View QR Code" : "Register Now"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="h-14 sm:h-12 text-base sm:text-lg font-semibold touch-manipulation"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Code Display Modal */}
      {qrCode && userData && selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => {
            setQrCode(null);
            setUserData(null);
            setSelectedEvent(null);
          }}
        >
          <Card 
            className="max-w-[95vw] sm:max-w-lg w-full mx-0 sm:mx-4 rounded-t-3xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="relative p-4 sm:p-6">
              <button
                onClick={() => {
                  setQrCode(null);
                  setUserData(null);
                  setSelectedEvent(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <CardTitle className="text-2xl sm:text-3xl pr-12">Your Registration</CardTitle>
              <CardDescription className="text-base">for {selectedEvent.title}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl">
                  <QRCodeSVG value={qrCode} size={250} level="H" className="mx-auto" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">
                    {userData.firstName} {userData.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Show this QR code at the event for check-in
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setQrCode(null);
                    setUserData(null);
                    setSelectedEvent(null);
                  }}
                  className="w-full h-14 sm:h-12 text-base sm:text-lg font-semibold touch-manipulation"
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
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => {
            setShowRSVPForm(false);
            setSelectedEvent(null);
          }}
        >
          <Card 
            className="max-w-[95vw] sm:max-w-lg w-full mx-0 sm:mx-4 rounded-t-3xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="relative p-4 sm:p-6">
              <button
                onClick={() => {
                  setShowRSVPForm(false);
                  setSelectedEvent(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <CardTitle className="text-xl sm:text-2xl pr-12">Complete Registration</CardTitle>
              <CardDescription className="text-base">for {selectedEvent.title}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <InlineRSVPForm
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onSuccess={() => {
                  setShowRSVPForm(false);
                  setSelectedEvent(null);
                  loadUserRegistrations(); // Reload to show QR code next time
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
