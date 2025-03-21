
// No changes needed to the existing file, only importing and using NotificationIndicator
import React from 'react';
import { User, MessageSquare, ChevronsUpDown, Clock, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileNotifications from './ProfileNotifications';
import NotificationIndicator from './NotificationIndicator';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex items-center gap-3">
      <ProfileNotifications>
        <NotificationIndicator className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer" />
      </ProfileNotifications>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg" alt="Profile" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            My Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/assistant')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Assistant</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/logs')}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Logs</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/dashboard')}>
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleNavigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileMenu;
