import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Announcement {
  id: string;
  type: 'update' | 'tip' | 'promotion' | 'community';
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionUrl?: string;
  badge?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const Icon = announcement.icon;

  const handleAction = () => {
    if (announcement.actionUrl) {
      window.open(announcement.actionUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <Icon size={20} className="text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-foreground">
              {announcement.title}
            </h4>
            {announcement.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                {announcement.badge}
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {announcement.description}
          </p>
          
          {announcement.actionLabel && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAction}
              className="text-xs"
            >
              {announcement.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;
