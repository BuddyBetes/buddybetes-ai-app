import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, ExternalLink, Bell, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import InlineRSVPForm from "@/components/events/InlineRSVPForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

const STATIC_WEBINAR_ID = '22222222-2222-2222-2222-222222222222';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
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

  const loadUserRegistrations = async () => {
    if (!user) return;
    
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
      }
    } catch (error) {
      console.error("Error loading user registrations:", error);
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
    // For webinar, open directly
    if (event.id === STATIC_WEBINAR_ID && event.video_url) {
      window.open(event.video_url, '_blank');
      return;
    }

    setSelectedEvent(event);
    setIsAutoPlaying(false);
    
    // Check if already registered
    const registration = eventRegistrations.get(event.id);
    if (registration) {
      // Show QR code directly, skip form
      setQrCode(registration.qrCode);
      setUserData({ firstName: registration.firstName, lastName: registration.lastName });
      setShowRSVPForm(false);
    } else {
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

  if (events.length === 0) return null;

  return (
    <section className="w-full py-4 sm:py-8">
      <div className="w-full max-w-sm mx-auto bg-background rounded-3xl shadow-lg overflow-hidden border border-border">
        {/* Header Section */}
        <div className="text-center p-6 pb-4">
          <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-sm font-medium px-3 py-1.5 rounded-full mb-3">
            <Bell className="h-4 w-4" />
            <span>What's New</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Latest Updates & Events</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Stay informed about new features, upcoming events, and community activities
          </p>
        </div>

        {/* Carousel Section */}
        <div className="relative px-6 pb-2">
          {/* Carousel Wrapper */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {events.map((event) => {
                const isWebinar = event.id === STATIC_WEBINAR_ID;
                const registrationData = eventRegistrations.get(event.id);
                const isRegistered = !!registrationData;
                
                // Define gradient based on event
                let gradientClass = "from-teal-400 to-cyan-500";
                if (event.color_gradient) {
                  gradientClass = event.color_gradient;
                } else if (isWebinar) {
                  gradientClass = "from-[#165e5e] to-[#208687]";
                }

                return (
                  <div key={event.id} className="w-full flex-shrink-0 px-1">
                    <div className={`bg-gradient-to-b ${gradientClass} text-white p-6 rounded-2xl flex flex-col min-h-[420px]`}>
                      {/* Badge */}
                      {event.badge && (
                        <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full self-start mb-3">
                          {event.badge}
                        </span>
                      )}
                      
                      {/* Title */}
                      <h2 className="text-2xl font-bold mb-2 leading-tight">
                        {event.title}
                      </h2>
                      
                      {/* Subtitle */}
                      {event.subtitle && (
                        <p className="text-sm opacity-90 mb-2">
                          {event.subtitle}
                        </p>
                      )}
                      
                      {/* Description */}
                      <p className="text-sm opacity-90 leading-relaxed mb-4 flex-grow">
                        {event.description}
                      </p>
                      
                      {/* Buttons - Stack vertically */}
                      <div className="space-y-2 mb-4">
                        <Button
                          onClick={() => handleShowInterest(event)}
                          className="w-full bg-white text-cyan-600 hover:bg-gray-100 font-semibold py-3 h-12 rounded-lg flex items-center justify-center transition-colors"
                        >
                          {isWebinar ? (
                            <>
                              Watch Now
                              <ExternalLink className="ml-2 h-5 w-5" />
                            </>
                          ) : isRegistered ? (
                            <>
                              View QR Code
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          ) : (
                            <>
                              Register Now
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsAutoPlaying(false);
                          }}
                          className="w-full bg-transparent border-2 border-white/50 text-white hover:bg-white/10 font-semibold py-3 h-12 rounded-lg transition-colors"
                        >
                          Learn More
                        </Button>
                      </div>
                      
                      {/* Date/Time Info */}
                      {event.event_date && (
                        <div className="flex items-center text-xs opacity-80">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          {new Date(event.event_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          {events.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full h-9 w-9 flex items-center justify-center shadow-md hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === events.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full h-9 w-9 flex items-center justify-center shadow-md hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Carousel Dots */}
        {events.length > 1 && (
          <div className="flex justify-center items-center pb-6 pt-4 space-x-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-cyan-500 w-6"
                    : "bg-gray-300 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent && !showRSVPForm && !qrCode} onOpenChange={(open) => {
        if (!open) {
          setSelectedEvent(null);
          setIsAutoPlaying(true);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedEvent && (
            <div className="space-y-4 p-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">{selectedEvent.title}</h2>
                {selectedEvent.subtitle && (
                  <p className="text-base text-muted-foreground">{selectedEvent.subtitle}</p>
                )}
              </div>
              
              <p className="text-sm sm:text-base leading-relaxed text-foreground">{selectedEvent.description}</p>
              
              {selectedEvent.event_date && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(selectedEvent.event_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span>📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.video_url && (
                <Button
                  onClick={() => window.open(selectedEvent.video_url!, "_blank")}
                  className="w-full"
                  size="lg"
                >
                  Watch Now
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RSVP Form Modal */}
      <Dialog open={showRSVPForm} onOpenChange={(open) => {
        if (!open) {
          setShowRSVPForm(false);
          setSelectedEvent(null);
          setIsAutoPlaying(true);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedEvent && (
            <div className="p-2">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">{selectedEvent.title}</h2>
                <p className="text-muted-foreground text-sm">Fill out the form below to register for this event</p>
              </div>
              <InlineRSVPForm
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onSuccess={() => {
                  loadUserRegistrations();
                  setShowRSVPForm(false);
                  setSelectedEvent(null);
                  setIsAutoPlaying(true);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Display Modal */}
      <Dialog open={!!qrCode} onOpenChange={(open) => {
        if (!open) {
          setQrCode(null);
          setUserData(null);
          setSelectedEvent(null);
          setIsAutoPlaying(true);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <div className="text-center space-y-4 p-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Registration Confirmed! 🎉</h2>
              {userData && (
                <p className="text-muted-foreground text-sm">
                  Welcome, {userData.firstName} {userData.lastName}!
                </p>
              )}
            </div>
            
            {qrCode && (
              <div className="bg-white p-6 rounded-2xl inline-block mx-auto shadow-lg">
                <QRCodeSVG
                  value={qrCode}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Show this QR code at the event for check-in
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Check your email for the QR code PNG attachment
              </p>
            </div>
            
            <Button
              onClick={() => {
                setQrCode(null);
                setUserData(null);
                setSelectedEvent(null);
                setIsAutoPlaying(true);
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AnnouncementsCarousel;
