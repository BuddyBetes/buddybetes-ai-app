
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, ShieldAlert, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    {
      icon: <Settings size={20} />,
      title: "Settings",
      description: "App preferences and account settings",
      onClick: () => navigate("/settings")
    },
    {
      icon: <ShieldAlert size={20} />,
      title: "Privacy",
      description: "Manage your data and privacy settings",
      onClick: () => navigate("/privacy")
    },
    {
      icon: <HelpCircle size={20} />,
      title: "Help",
      description: "Get help and support",
      onClick: () => navigate("/help")
    },
    {
      icon: <LogOut size={20} />,
      title: "Sign Out",
      description: "Sign out of your account",
      onClick: handleLogout,
      className: "text-red-500"
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition-colors ${item.className || ""}`}
            onClick={item.onClick}
          >
            <div className="flex-shrink-0 mr-4 text-gray-500">{item.icon}</div>
            <div className="flex-1">
              <h3 className={`font-medium ${item.className || ""}`}>{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileMenu;
