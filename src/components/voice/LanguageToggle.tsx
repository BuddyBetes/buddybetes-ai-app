
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface LanguageToggleProps {
  isTaglishEnabled: boolean;
  onToggleLanguage: (enabled: boolean) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  isTaglishEnabled, 
  onToggleLanguage 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Taglish</span>
      <Switch 
        checked={isTaglishEnabled} 
        onCheckedChange={onToggleLanguage}
        aria-label="Toggle Taglish mode"
      />
      <span className="text-sm font-medium text-gray-500">
        {isTaglishEnabled ? 'On' : 'Off'}
      </span>
    </div>
  );
};

export default LanguageToggle;
