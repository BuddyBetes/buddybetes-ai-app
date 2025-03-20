
import React from 'react';

interface LanguageToggleProps {
  // Future extension point for language selection
}

const LanguageToggle: React.FC<LanguageToggleProps> = () => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Tagalog</span>
      <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
      </div>
      <span className="text-sm font-medium text-gray-500">Off</span>
    </div>
  );
};

export default LanguageToggle;
