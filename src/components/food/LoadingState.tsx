
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-buddy-500 animate-spin mb-4" />
          <p className="text-center text-gray-600">Analyzing your food image...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
