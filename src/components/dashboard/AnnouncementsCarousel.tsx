import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import InlineRSVPForm from '@/components/events/InlineRSVPForm';

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

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length]);

  // Pause auto-play when modal is open
  useEffect(() => {
    if (selectedEvent) {
      setIsAutoPlaying(false);
    }
  }, [selectedEvent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEvent) return;
      
      if (e.key === 'ArrowLeft') {
        prevSlide();
        setIsAutoPlaying(false);
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        setIsAutoPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent, events.length]);

  if (events.length === 0) {
    return null;
  }

  const currentEvent = events[currentSlide];

  return (
    <section className="w-full bg-gradient-to-b from-background to-muted/20 rounded-xl overflow-hidden">
      {/* Section Header */}
      <div className="text-center pt-4 pb-3 px-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-2">
          <Bell className="h-3 w-3" />
          <span className="text-xs font-medium">What's New</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Latest Updates & Events
        </h2>
      </div>

      {/* Main Slider */}
      <div className="relative mb-4 px-4">
        <div className="overflow-hidden rounded-xl shadow-lg">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {events.map((event) => (
              <div key={event.id} className="min-w-full">
                <div className="relative h-48 md:h-56">
                  {/* Background Image with Overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image_url})` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${event.color_gradient || 'from-primary/90 to-primary/70'} opacity-95`}></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex items-center px-6 md:px-10">
                    <div className="max-w-2xl text-white [&>*]:drop-shadow-lg">
                      <Badge className="mb-2 bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 text-xs font-semibold">
                        {event.badge || 'Upcoming Event'}
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-bold mb-1">
                        {event.title}
                      </h3>
                      {event.subtitle && (
                        <p className="text-base md:text-lg font-medium mb-2 text-white/95">
                          {event.subtitle}
                        </p>
                      )}
                      <p className="text-sm mb-3 text-white/90 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button 
                          onClick={() => handleShowInterest(event)}
                          className="bg-white text-primary hover:bg-white/90 font-semibold text-sm h-8 px-4"
                        >
                          Register Now
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                        <Button 
                          onClick={() => setSelectedEvent(event)}
                          variant="outline"
                          className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30 hover:text-white text-sm h-8 px-4"
                        >
                          Learn More
                        </Button>
                        <div className="flex items-center gap-1.5 text-white drop-shadow-md ml-2">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {events.length > 1 && (
          <>
            <button
              onClick={() => {
                prevSlide();
                setIsAutoPlaying(false);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 text-gray-800" />
            </button>
            <button
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 text-gray-800" />
            </button>
          </>
        )}
      </div>

        {/* Dot Indicators */}
        {events.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentSlide
                    ? 'w-6 bg-primary shadow-md'
                    : 'w-1.5 bg-gray-400 hover:bg-gray-600'
                } h-1.5 rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

      {/* Modal for Event Details */}
      {selectedEvent && !showRSVPForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {selectedEvent.badge || 'Upcoming Event'}
                </Badge>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="hover:bg-muted p-2 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div 
                className="h-40 rounded-lg mb-4 bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: `url(${selectedEvent.image_url})` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedEvent.color_gradient || 'from-primary/90 to-primary/70'} opacity-70`}></div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {selectedEvent.title}
              </h3>
              {selectedEvent.subtitle && (
                <p className="text-lg text-foreground/80 mb-3">
                  {selectedEvent.subtitle}
                </p>
              )}
              <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="h-4 w-4" />
                <span>Event Date: {format(new Date(selectedEvent.event_date), 'PPP p')}</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleShowInterest(selectedEvent)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

      {/* Modal for RSVP Form */}
      {showRSVPForm && selectedEvent && user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Register for {selectedEvent.title}</h3>
                <button
                  onClick={() => {
                    setShowRSVPForm(false);
                    setSelectedEvent(null);
                    setIsAutoPlaying(true);
                  }}
                  className="hover:bg-muted p-2 rounded-full transition-colors"
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
