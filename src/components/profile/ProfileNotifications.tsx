
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
  scheduled_for: string | null;
}

interface ProfileNotificationsProps {
  children: React.ReactNode;
}

const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const instanceId = useRef(Math.random().toString(36).slice(2));

  // Fetch notifications from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Failed to load notifications",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Unique per-instance channel name: if two instances subscribe at once,
    // supabase.channel() returns the same already-subscribed channel and
    // calling .on() on it throws. A stable instance id prevents that.
    const channel = supabase
      .channel(`notifications-panel-${user.id}-${instanceId.current}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh notifications when changes occur
          fetchNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) {
        throw error;
      }
      
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      
      toast({
        title: "Notifications cleared",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Failed to update notifications",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Failed to delete notification",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, h:mm a');
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock size={16} className="text-blue-500" />;
      case 'alert':
        return <Bell size={16} className="text-red-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <Sheet>
      {children}
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : notifications.length > 0 ? (
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
                    <div className="font-medium flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      {notification.title}
                    </div>
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{notification.message}</div>
                  <div className="text-xs text-gray-500">
                    {formatNotificationDate(notification.created_at)}
                  </div>
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
