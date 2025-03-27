
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackToLogButtonProps {
  visible: boolean;
}

const BackToLogButton: React.FC<BackToLogButtonProps> = ({ visible }) => {
  const navigate = useNavigate();

  if (!visible) return null;
  
  const handleBackToLog = () => {
    navigate('/add-log');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-16 left-4 z-20 flex items-center gap-1 text-gray-600"
      onClick={handleBackToLog}
    >
      <ArrowLeft size={16} />
      <span>Back to Log</span>
    </Button>
  );
};

export default BackToLogButton;
