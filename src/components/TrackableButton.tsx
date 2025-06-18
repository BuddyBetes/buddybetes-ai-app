
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TrackableButtonProps extends ButtonProps {
  trackingId: string;
  trackingMetadata?: Record<string, any>;
}

const TrackableButton: React.FC<TrackableButtonProps> = ({ 
  trackingId, 
  trackingMetadata, 
  onClick, 
  children, 
  ...props 
}) => {
  const { trackFeatureClick } = useAnalytics();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await trackFeatureClick(trackingId, trackingMetadata);
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

export default TrackableButton;
