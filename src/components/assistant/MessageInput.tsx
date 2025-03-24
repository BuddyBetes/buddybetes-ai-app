
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SuggestionChips from '../SuggestionChips';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
}

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  onVoiceMode: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  isLoading,
  onInputChange,
  onSend,
  onSuggestionSelect,
  onVoiceMode,
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

  return (
    <div className="w-full">
      <div className="mb-2">
        <SuggestionChips onSelectSuggestion={onSuggestionSelect} />
      </div>
      
      <div className="flex items-center gap-2 bg-gray-50 rounded-full p-2 border border-gray-200">
        <Button
          type="button"
          variant="ghost" 
          size="icon"
          className="rounded-full overflow-hidden flex-shrink-0"
          onClick={onVoiceMode}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="bg-buddy-100 text-buddy-800 text-sm">
              {loading ? <User className="h-4 w-4" /> : getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
        
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={isLoading ? "Assistant is responding..." : "Type your message..."}
          className="resize-none border-none bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 h-10 min-h-10 max-h-32 overflow-y-auto flex-grow"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                onSend();
              }
            }
          }}
        />

        {input.trim() ? (
          <Button 
            onClick={onSend}
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#35cab4] text-white hover:bg-[#29A493] flex-shrink-0"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </motion.div>
              </div>
            ) : (
              <Send size={18} />
            )}
          </Button>
        ) : (
          input ? (
            <Button 
              onClick={() => onInputChange('')}
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-500 flex-shrink-0"
            >
              <X size={18} />
            </Button>
          ) : null
        )}
      </div>
    </div>
  );
};

export default MessageInput;
