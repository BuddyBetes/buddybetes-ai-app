import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Lightbulb, 
  Gift, 
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import AnnouncementCard, { Announcement } from './AnnouncementCard';

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '0',
    type: 'update',
    title: 'Join Our Upcoming Event! 🎉',
    description: 'Register now for our exclusive BuddyBetes community event. Enter our raffle for amazing prizes!',
    icon: Calendar,
    badge: 'New Event',
    actionLabel: 'Register Now',
    actionUrl: '/event/upcoming'
  },
  {
    id: '1',
    type: 'update',
    title: 'Welcome to Your Dashboard',
    description: 'Track your glucose levels, log meals, and get personalized insights all in one place.',
    icon: Sparkles,
    badge: 'New',
    actionLabel: 'Get Started',
    actionUrl: '/logs'
  },
  {
    id: '2',
    type: 'tip',
    title: 'Daily Health Tip',
    description: 'Monitor your glucose 2 hours after meals to understand how different foods affect your levels.',
    icon: Lightbulb,
    actionLabel: 'Learn More'
  },
  {
    id: '3',
    type: 'promotion',
    title: '30 Days Free Premium',
    description: 'Use code "Free30Days" to unlock AI insights, voice logging, and advanced analytics.',
    icon: Gift,
    badge: 'Limited',
    actionLabel: 'Claim Now',
    actionUrl: '/subscription'
  },
  {
    id: '4',
    type: 'community',
    title: 'Try Voice Assistant',
    description: 'Log your glucose and meals using voice commands. Just tap the microphone and speak naturally.',
    icon: Users,
    actionLabel: 'Try Voice Mode',
    actionUrl: '/assistant'
  }
];

const AUTO_ROTATE_INTERVAL = 5000; // 5 seconds

const AnnouncementSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  }, []);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    // Resume auto-rotation after 10 seconds of manual selection
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(goToNext, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="col-span-2 rounded-xl bg-card shadow-sm overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
          {ANNOUNCEMENTS.map((announcement, index) => {
            const Icon = announcement.icon;
            return (
              <button
                key={announcement.id}
                onClick={() => goToIndex(index)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
                  transition-all duration-200 whitespace-nowrap
                  ${currentIndex === index 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">
                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={goToPrevious}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Announcement Content */}
      <div className="relative min-h-[120px]">
        <AnimatePresence mode="wait">
          <AnnouncementCard
            key={ANNOUNCEMENTS[currentIndex].id}
            announcement={ANNOUNCEMENTS[currentIndex]}
          />
        </AnimatePresence>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-1.5 px-4 pb-3">
        {ANNOUNCEMENTS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className="group"
            aria-label={`Go to announcement ${index + 1}`}
          >
            <div className={`
              h-1.5 rounded-full transition-all duration-300
              ${currentIndex === index 
                ? 'w-6 bg-primary' 
                : 'w-1.5 bg-muted group-hover:bg-muted-foreground/50'
              }
            `} />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default AnnouncementSection;
