
import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfileHeader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center mb-6 pt-4"
    >
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage src="" alt="Profile" />
        <AvatarFallback className="bg-buddy-100 text-buddy-800 text-2xl">
          <User size={40} />
        </AvatarFallback>
      </Avatar>
      
      <h2 className="text-xl font-bold">Jane Cooper</h2>
      <p className="text-gray-500">jane.cooper@example.com</p>
    </motion.div>
  );
};

export default ProfileHeader;
