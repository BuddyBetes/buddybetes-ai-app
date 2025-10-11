import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  eventId?: string;
  onScanSuccess?: (data: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ eventId, onScanSuccess }) => {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    attendee?: any;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        handleScanError
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (processing) return;

    setProcessing(true);
    console.log('QR Code scanned:', decodedText);

    try {
      const { data, error } = await supabase.functions.invoke('event-checkin', {
        body: { qrCode: decodedText },
      });

      if (error) throw error;

      if (data.alreadyCheckedIn) {
        setLastResult({
          success: false,
          message: `${data.attendee.firstName} ${data.attendee.lastName} was already checked in`,
          attendee: data.attendee,
        });
        toast({
          title: 'Already Checked In',
          description: `${data.attendee.firstName} ${data.attendee.lastName} was checked in at ${new Date(data.attendee.checkedInAt).toLocaleTimeString()}`,
        });
      } else {
        setLastResult({
          success: true,
          message: `${data.attendee.firstName} ${data.attendee.lastName} checked in successfully!`,
          attendee: data.attendee,
        });
        toast({
          title: 'Check-in Successful',
          description: `${data.attendee.firstName} ${data.attendee.lastName} has been checked in`,
        });
        
        if (onScanSuccess) {
          onScanSuccess(data);
        }
      }

      // Clear result after 3 seconds
      setTimeout(() => {
        setLastResult(null);
        setProcessing(false);
      }, 3000);
    } catch (error: any) {
      console.error('Check-in error:', error);
      setLastResult({
        success: false,
        message: error.message || 'Invalid QR code',
      });
      toast({
        title: 'Check-in Failed',
        description: error.message || 'Invalid QR code',
        variant: 'destructive',
      });
      setTimeout(() => {
        setLastResult(null);
        setProcessing(false);
      }, 3000);
    }
  };

  const handleScanError = (error: string) => {
    // Ignore common scanning errors
    if (!error.includes('NotFoundException')) {
      console.warn('QR scan error:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">QR Code Scanner</h3>
            <p className="text-sm text-muted-foreground">
              Scan attendee QR codes to check them in
            </p>
          </div>

          {/* Scanner View */}
          <div className="relative">
            <div
              id="qr-reader"
              className={`w-full rounded-lg overflow-hidden ${isScanning ? '' : 'hidden'}`}
            />
            
            {!isScanning && (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <div className="text-center space-y-3">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Camera not active</p>
                </div>
              </div>
            )}

            {/* Processing Overlay */}
            {processing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Scan Result */}
          {lastResult && (
            <div
              className={`p-4 rounded-lg ${
                lastResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {lastResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      lastResult.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {lastResult.message}
                  </p>
                  {lastResult.attendee && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {lastResult.attendee.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1 touch-manipulation" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="destructive"
                className="flex-1 touch-manipulation"
                size="lg"
              >
                Stop Scanning
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;
