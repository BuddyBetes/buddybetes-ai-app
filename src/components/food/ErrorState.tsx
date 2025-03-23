
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-center text-red-500 mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">Try Again</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
