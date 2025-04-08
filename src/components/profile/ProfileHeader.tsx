
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
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
        <AvatarFallback className="bg-green-50 text-green-700 text-2xl">
          {loading ? <User size={40} /> : getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <h2 className="text-xl font-bold">{loading ? 'Loading...' : getDisplayName()}</h2>
      <p className="text-gray-500">{user?.email || ''}</p>
    </motion.div>
  );
};

export default ProfileHeader;
