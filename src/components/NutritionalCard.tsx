
import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface NutritionalCardProps {
  name: string;
  details: string;
}

const NutritionalCard: React.FC<NutritionalCardProps> = ({ name, details }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="ml-3 max-w-[80%] bg-gray-50 rounded-lg p-3 border border-gray-200"
    >
      <div className="flex items-start gap-2">
        <Info size={16} className="text-buddy-600 mt-1 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-buddy-700 mb-1">Nutritional Info: {name}</h4>
          <p className="text-xs text-gray-600">{details}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionalCard;
