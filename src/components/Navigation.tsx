
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Plus, 
  Mic, 
  UserCircle 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  
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
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex z-50 px-2">
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
                <div className="buddy-gradient w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                  <item.icon size={24} className="text-white" />
                </div>
              </div>
            ) : (
              <div className={`nav-item ${isActive ? 'active' : 'inactive'} ${isMobile ? 'text-[10px]' : ''}`}>
                <item.icon size={isMobile ? 18 : 20} />
                <span className={`mt-1 ${isMobile ? 'text-[10px]' : ''}`}>{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-1 bg-buddy-500 rounded-t-md" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Navigation;
