
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseInsights } from '@/hooks/useGlucoseInsights';

const AIPreferences = () => {
  const [isTagalogEnabled, setIsTagalogEnabled] = useState(false);
  const { toast } = useToast();
  const { refreshInsights } = useGlucoseInsights();
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  const handleLanguageToggle = (checked: boolean) => {
    setIsTagalogEnabled(checked);
    
    // Update localStorage to persist language preference
    localStorage.setItem('preferTagalog', checked ? 'true' : 'false');
    
    // Refresh insights to get them in the new language
    refreshInsights();
    
    // Show confirmation toast
    toast({
      title: checked ? "Language Changed" : "Language Changed",
      description: checked ? "Insights will now be in Tagalog" : "Insights will now be in English",
      variant: "default"
    });
  };

  return (
    <motion.div 
      custom={0}
      variants={itemVariants}
      className="p-4 border-b border-gray-100"
    >
      <h3 className="text-sm font-medium text-gray-500 mb-4">AI Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-buddy-100 flex items-center justify-center">
              <span className="text-buddy-600 text-xs">🇺🇸</span>
            </div>
            <span className="text-sm font-medium">English (US)</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <Languages size={16} className="text-rose-600" />
            </div>
            <div>
              <span className="text-sm font-medium">Tagalog</span>
              <p className="text-xs text-gray-500">AI insights in Tagalog</p>
            </div>
          </div>
          <Switch 
            checked={isTagalogEnabled}
            onCheckedChange={handleLanguageToggle}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AIPreferences;
