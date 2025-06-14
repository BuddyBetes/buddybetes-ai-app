
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, disabled = false }) => {
  return (
    <motion.div
      whileHover={{ scale: loading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
    >
      <Button 
        type="submit" 
        className="w-full h-11 mt-2 text-base bg-buddy-500 hover:bg-buddy-600"
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Log'
        )}
      </Button>
    </motion.div>
  );
};

export default SubmitButton;
