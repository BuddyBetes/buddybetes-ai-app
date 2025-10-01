import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyAccount();
  }, []);

  const verifyAccount = async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-account', {
        body: { token },
      });

      if (error) throw error;

      setStatus('success');
      setMessage(data.message);
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to verify account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying your account...</h2>
            <p className="text-muted-foreground">Please wait while we set everything up.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-900">Account Verified!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-blue-900 mb-2">What's next?</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Your event QR code has been sent to your email</li>
                  <li>✓ Password reset email sent - check your inbox</li>
                  <li>✓ Log in to access your BuddyBetes account</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/signin')} className="w-full">
                Go to Sign In
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-900">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyAccount;
