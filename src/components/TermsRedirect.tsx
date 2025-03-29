
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsRedirect = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleBack}
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default TermsRedirect;
