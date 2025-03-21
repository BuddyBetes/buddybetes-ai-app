
import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { SheetTrigger } from '@/components/ui/sheet';

interface NotificationIndicatorProps {
  className?: string;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({ className }) => {
  const { unreadCount, isLoading } = useNotifications();
  
  return (
    <SheetTrigger className={cn("relative", className)}>
      <Bell className="h-5 w-5" />
      {!isLoading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </SheetTrigger>
  );
};

export default NotificationIndicator;
