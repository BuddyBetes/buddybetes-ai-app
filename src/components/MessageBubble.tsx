import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NutritionalInfo, GlucoseStats, TrendAnalysis } from '@/types';
import NutritionalCard from './NutritionalCard';
import { TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
}

interface MessageBubbleProps {
  text: string;
  type: 'user' | 'assistant';
  nutritionalInfo?: NutritionalInfo;
  stats?: GlucoseStats;
  trendAnalysis?: TrendAnalysis;
  isNew?: boolean;
  timestamp?: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  text, 
  type, 
  nutritionalInfo,
  stats,
  trendAnalysis,
  isNew = false,
  timestamp
}) => {
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
          .maybeSingle();

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

  // Get user initials the same way as ProfileHeader
  const getInitials = () => {
    if (!profile) return user?.email?.charAt(0).toUpperCase() || 'U';
    
    const firstName = profile.first_name?.charAt(0) || '';
    const lastName = profile.last_name?.charAt(0) || '';
    
    return firstName + lastName || user?.email?.charAt(0).toUpperCase() || 'U';
  };
  
  // Format timestamp to readable format
  const formatTimestamp = () => {
    if (!timestamp) return 'Just now';
    
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Just now';
    }
  };
  
  return (
    <div className="space-y-2 w-full">
      <motion.div
        className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
        initial={isNew ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {type === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-[#35cab4] mr-2 flex-shrink-0 self-end flex items-center justify-center">
            <span className="text-xs font-bold text-white">BB</span>
          </div>
        )}
        
        <div
          className={`max-w-[80%] rounded-3xl py-2.5 px-3.5 ${
            type === 'user'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-[#35cab4] text-white'
          }`}
        >
          <div className="flex flex-col">
            {text}
            <span className={`text-xs mt-1 ${type === 'user' ? 'text-gray-500' : 'text-white/70'}`}>
              {formatTimestamp()}
            </span>
          </div>
        </div>
        
        {type === 'user' && (
          <Avatar className="w-8 h-8 ml-2 flex-shrink-0 self-end">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-buddy-100 text-buddy-800 text-sm">
              {loading ? 'U' : getInitials()}
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
      
      {nutritionalInfo && (
        <NutritionalCard 
          name={nutritionalInfo.name} 
          details={nutritionalInfo.details} 
        />
      )}
      
      {stats && type === 'assistant' && (
        <div className="ml-10 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-2 text-gray-700 flex items-center">
            <Activity size={14} className="mr-1 text-buddy-500" />
            Glucose Statistics
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Average:</span> {stats.average} mg/dL
            </div>
            <div>
              <span className="text-gray-500">Min/Max:</span> {stats.min}/{stats.max} mg/dL
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Time in Range:</span> {stats.inRangePercent}% (70-140 mg/dL)
            </div>
          </div>
        </div>
      )}
      
      {trendAnalysis && type === 'assistant' && (
        <div className="ml-10 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-2 text-gray-700 flex items-center">
            {trendAnalysis.direction === 'increasing' ? (
              <TrendingUp size={14} className="mr-1 text-orange-500" />
            ) : trendAnalysis.direction === 'decreasing' ? (
              <TrendingDown size={14} className="mr-1 text-green-500" />
            ) : (
              <ArrowRight size={14} className="mr-1 text-blue-500" />
            )}
            Glucose Trend Analysis
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-gray-500">Direction:</span> {trendAnalysis.direction.charAt(0).toUpperCase() + trendAnalysis.direction.slice(1)}
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Change:</span>
              <span>{trendAnalysis.firstHalfAvg} mg/dL</span>
              <ArrowRight size={14} className="mx-1" />
              <span>{trendAnalysis.secondHalfAvg} mg/dL</span>
              <span className="ml-1 text-gray-500">({trendAnalysis.magnitude} mg/dL)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
