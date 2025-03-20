
import React from 'react';
import { Bell, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAssistant = location.pathname === '/assistant';
  
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'Medication Reminder', message: 'Time to take your evening medication', read: false },
    { id: 2, title: 'High Glucose Alert', message: 'Your glucose level was higher than usual after lunch', read: false }
  ]);
  
  // Don't show header on assistant page since it has its own layout
  if (isAssistant) return null;
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read",
    });
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-3 flex justify-between items-center bg-white shadow-sm">
      <div className="text-xl font-bold text-buddy-600">BuddyBetes</div>
      <div className="flex items-center space-x-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              {notifications.some(n => !n.read) && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{notifications.filter(n => !n.read).length}</div>
              )}
              <Bell size={20} className="text-gray-700" />
            </button>
          </SheetTrigger>
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
                      <div className="font-medium mb-1">{notification.title}</div>
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
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={navigateToProfile}
        >
          <User size={20} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
