
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Plus, 
  Mic, 
  UserCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Logs', path: '/logs', icon: ClipboardList },
    { name: 'Add', path: '/add-log', icon: Plus },
    { name: 'Assistant', path: '/assistant', icon: Mic },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex z-50 px-2"
    >
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        const isAdd = item.name === 'Add';
        
        return (
          <div 
            key={item.name}
            className={`relative flex-1 flex items-center justify-center ${isAdd ? 'px-3' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            {isAdd ? (
              <div className="absolute -top-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="buddy-gradient w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <item.icon size={24} className="text-white" />
                </motion.div>
              </div>
            ) : (
              <div className={`nav-item ${isActive ? 'active' : 'inactive'}`}>
                <item.icon size={20} />
                <span className="mt-1">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute bottom-0 w-8 h-1 bg-buddy-500 rounded-t-md"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </motion.nav>
  );
};

export default Navigation;
