import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLogContext } from '@/context/LogContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
  scheduled_for: string | null;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logs } = useLogContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
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
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a notification
  const createNotification = async (
    title: string, 
    message: string, 
    type: string = 'info',
    scheduledFor: Date | null = null
  ) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          scheduled_for: scheduledFor ? scheduledFor.toISOString() : null
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Show a toast for immediate notifications
      if (!scheduledFor) {
        toast({
          title,
          description: message,
        });
      }
      
      // Update local state
      fetchNotifications();
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
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
      
      // Update local state
      fetchNotifications();
      
      toast({
        title: "Notifications cleared",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Delete a notification
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
      
      // Update local state
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Check for glucose patterns and create alerts if needed
  const checkGlucosePatterns = () => {
    if (!user || logs.length < 3) return;
    
    // Sort logs by timestamp in descending order
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Get the 3 most recent logs
    const recentLogs = sortedLogs.slice(0, 3);
    
    // Check for high glucose pattern (3 consecutive readings above 180)
    const allHigh = recentLogs.every(log => log.glucoseLevel > 180);
    if (allHigh) {
      createNotification(
        "High Glucose Pattern Detected",
        "Your last 3 glucose readings have been above 180 mg/dL. Consider checking with your healthcare provider.",
        "alert"
      );
      return;
    }
    
    // Check for low glucose pattern (2 consecutive readings below 70)
    const twoLow = recentLogs.slice(0, 2).every(log => log.glucoseLevel < 70);
    if (twoLow) {
      createNotification(
        "Low Glucose Alert",
        "Your last 2 glucose readings have been below 70 mg/dL. Please check your blood sugar and take appropriate action.",
        "alert"
      );
      return;
    }
    
    // Check for erratic pattern (rapid change of more than 100 mg/dL)
    const latestTwo = recentLogs.slice(0, 2);
    const difference = Math.abs(latestTwo[0].glucoseLevel - latestTwo[1].glucoseLevel);
    if (difference > 100) {
      createNotification(
        "Rapid Glucose Change",
        `Your glucose level changed by ${difference} mg/dL in your last two readings. Monitor your levels closely.`,
        "alert"
      );
    }
  };

  // Create a scheduled measurement reminder
  const scheduleReminder = async (timeInMinutes: number, message: string = "Time to check your glucose level") => {
    if (!user) return;
    
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + timeInMinutes);
    
    return await createNotification(
      "Glucose Check Reminder",
      message,
      "reminder",
      scheduledTime
    );
  };

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel(`notifications-hook-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Check for patterns when logs change
  useEffect(() => {
    if (logs.length > 0) {
      checkGlucosePatterns();
    }
  }, [logs]);

  return {
    notifications,
    unreadCount,
    isLoading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    scheduleReminder,
    checkGlucosePatterns
  };
};
