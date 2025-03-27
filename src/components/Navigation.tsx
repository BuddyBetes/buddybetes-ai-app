
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
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex z-50 px-2 pb-safe-bottom">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        
        return (
          <div 
            key={item.name}
            className="relative flex-1 flex items-center justify-center cursor-pointer touch-manipulation"
            onClick={() => handleNavigation(item.path)}
          >
            <div className={`nav-item ${isActive ? 'active' : 'inactive'} ${isMobile ? 'text-[10px]' : ''}`}>
              <item.icon size={isMobile ? 18 : 20} className="mx-auto" />
              <span className={`mt-1 ${isMobile ? 'text-[10px]' : ''}`}>{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-buddy-500 rounded-t-md" />
              )}
            </div>
          </div>
        );
      })}

      {/* Add button for Dashboard and Logs pages */}
      {(currentPath === '/dashboard' || currentPath === '/logs') && (
        <button
          onClick={handleAddClick}
          aria-label="Add new log"
          className="fixed bottom-20 right-6 w-14 h-14 bg-buddy-500 rounded-full shadow-lg flex items-center justify-center text-white touch-manipulation"
        >
          <Plus size={24} />
        </button>
      )}
    </nav>
  );
};

export default Navigation;
