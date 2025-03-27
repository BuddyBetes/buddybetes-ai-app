
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Mic, 
  UserCircle,
  Plus
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Monitor if any textarea or input is focused
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        setIsInputFocused(true);
      }
    };
    
    const handleBlur = (e: FocusEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        setIsInputFocused(false);
      }
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Logs', path: '/logs', icon: ClipboardList },
    { name: 'Assistant', path: '/assistant', icon: Mic },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];
  
  const handleNavigation = (path: string) => {
    if (isInputFocused) {
      return; // Prevent navigation when input is focused
    }
    navigate(path);
  };

  // Handle add button click
  const handleAddClick = () => {
    navigate('/add-log');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 px-2 pb-safe-bottom pt-3">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        
        return (
          <div 
            key={item.name}
            className="relative flex-1 flex flex-col items-center justify-center cursor-pointer touch-manipulation py-2"
            onClick={() => handleNavigation(item.path)}
          >
            <div className={`nav-item flex flex-col items-center ${isActive ? 'active' : 'inactive'}`}>
              <item.icon size={isMobile ? 20 : 22} className="mb-1" />
              <span className={`text-xs ${isMobile ? 'text-[10px]' : ''}`}>{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-buddy-500 rounded-t-md" />
              )}
            </div>
          </div>
        );
      })}

      {/* Add button for Dashboard and Logs pages with responsive positioning */}
      {(currentPath === '/dashboard' || currentPath === '/logs') && (
        <button
          onClick={handleAddClick}
          aria-label="Add new log"
          className="fixed right-6 w-14 h-14 bg-buddy-500 rounded-full shadow-lg flex items-center justify-center text-white touch-manipulation transition-all duration-300"
          style={{
            bottom: `calc(${isMobile ? '70px' : '80px'} + var(--safe-area-bottom, 0px))`,
            zIndex: 40
          }}
        >
          <Plus size={24} />
        </button>
      )}
    </nav>
  );
};

export default Navigation;
