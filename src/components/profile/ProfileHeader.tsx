
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
}

const ProfileHeader = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching profile for user:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile data');
        } else {
          console.log("Profile data received:", data);
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user]);

  const getInitials = () => {
    if (!profile) return user?.email?.charAt(0).toUpperCase() || 'U';
    
    const firstName = profile.first_name?.charAt(0) || '';
    const lastName = profile.last_name?.charAt(0) || '';
    
    return firstName + lastName || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!profile) return user?.email || 'User';
    
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    
    return user?.email || 'User';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center mb-6 pt-4"
    >
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage src="" alt="Profile" />
        <AvatarFallback className="bg-buddy-100 text-buddy-800 text-2xl">
          {loading ? <User size={40} /> : getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold">{getDisplayName()}</h2>
          <p className="text-gray-500">{user?.email || ''}</p>
        </>
      )}
    </motion.div>
  );
};

export default ProfileHeader;
