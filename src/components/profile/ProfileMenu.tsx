
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SheetTrigger } from '@/components/ui/sheet';
import ProfileNotifications from './ProfileNotifications';

const ProfileMenu = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'bg-gray-100', path: '/settings' },
    { icon: Bell, label: 'Notifications', color: 'bg-blue-100', isNotification: true },
    { icon: Lock, label: 'Privacy', color: 'bg-purple-100', path: '/privacy' },
    { icon: HelpCircle, label: 'Help', color: 'bg-green-100', path: '/help' },
    { icon: LogOut, label: 'Logout', color: 'bg-red-100' },
  ];
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  const handleMenuItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
          },
        },
      }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {menuItems.map((item, index) => (
        <motion.div
          key={item.label}
          custom={index}
          variants={itemVariants}
          className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
          onClick={() => !item.isNotification && handleMenuItemClick(item.path)}
        >
          {item.isNotification ? (
            <ProfileNotifications>
              <SheetTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </SheetTrigger>
            </ProfileNotifications>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                  <item.icon size={16} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProfileMenu;
