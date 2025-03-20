
import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
}

interface ProfileNotificationsProps {
  children: React.ReactNode;
}

const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({ children }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Medication Reminder', message: 'Time to take your evening medication', read: false },
    { id: 2, title: 'High Glucose Alert', message: 'Your glucose level was higher than usual after lunch', read: false }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <Sheet>
      {children}
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        
        {notifications.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">{notifications.length} notifications</span>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </div>
            
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-100'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{notification.title}</div>
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{notification.message}</div>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-gray-400 mb-3">
              <Bell size={40} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
            <p className="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProfileNotifications;
