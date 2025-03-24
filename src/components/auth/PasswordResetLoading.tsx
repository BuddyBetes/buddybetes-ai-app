
import React from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PasswordResetLoading = () => {
  return (
    <Card className="border-none shadow-lg w-full max-w-md">
      <CardContent className="p-6 pt-6 text-center">
        <Lock size={32} className="mx-auto text-buddy-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-4">Verifying Reset Link</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buddy-500"></div>
        </div>
        <p className="mt-4 text-gray-500">Please wait while we verify your password reset link...</p>
      </CardContent>
    </Card>
  );
};

export default PasswordResetLoading;
