
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface NoFoodStateProps {
  onRetry: () => void;
}

const NoFoodState: React.FC<NoFoodStateProps> = ({ onRetry }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">No Food Detected</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6">
          <Camera className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-center text-gray-600 mb-4">
            We couldn't identify any food in this image. Please try again with a clearer photo.
          </p>
          <Button onClick={onRetry} variant="outline">
            Take Another Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoFoodState;
