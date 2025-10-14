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
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
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
      setIsScanning(true);
      
      // Small delay to ensure DOM updates before initializing scanner
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      setIsScanning(false);
      
      let errorMessage = 'Could not access camera. Please check permissions.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      }
      
      toast({
        title: 'Camera Error',
        description: errorMessage,
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
    if (processing || lastScannedCode === decodedText) return;

    setProcessing(true);
    setLastScannedCode(decodedText);
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
        
        // Reset after failed scan
        setTimeout(() => {
          setProcessing(false);
          setLastScannedCode('');
          setLastResult(null);
        }, 2000);
      } else {
        // Stop scanner on successful check-in
        await stopScanning();
        setShowSuccess(true);
        
        setLastResult({
          success: true,
          message: `${data.attendee.firstName} ${data.attendee.lastName} checked in successfully!`,
          attendee: data.attendee,
        });
        toast({
          title: 'Check-in Successful! ✅',
          description: `${data.attendee.firstName} ${data.attendee.lastName} has been checked in`,
          duration: 5000,
        });
        
        if (onScanSuccess) {
          onScanSuccess(data);
        }
      }
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
        setProcessing(false);
        setLastScannedCode('');
        setLastResult(null);
      }, 2000);
    }
  };

  const resetScanner = () => {
    setShowSuccess(false);
    setLastResult(null);
    setProcessing(false);
    setLastScannedCode('');
    startScanning();
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
            <h3 className="text-base sm:text-lg font-semibold mb-2">QR Code Scanner</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Scan attendee QR codes to check them in
            </p>
          </div>

          {/* Success Screen */}
          {showSuccess && lastResult?.success ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center h-64 sm:h-80 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="text-center space-y-4 p-4">
                  <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-green-600" />
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-green-900 mb-2">
                      Check-in Successful!
                    </p>
                    <p className="text-base sm:text-lg font-medium text-green-700">
                      {lastResult.message}
                    </p>
                    {lastResult.attendee && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {lastResult.attendee.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                onClick={resetScanner} 
                className="w-full h-12 sm:h-11 touch-manipulation text-base" 
                size="lg"
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Next Attendee
              </Button>
            </div>
          ) : (
            <>
              {/* Scanner View */}
              <div className="relative">
                <div
                  id="qr-reader"
                  className="w-full rounded-lg overflow-hidden min-h-[280px] sm:min-h-[320px]"
                  style={{ display: isScanning ? 'block' : 'none' }}
                />
                
                {!isScanning && (
                  <div className="flex items-center justify-center h-64 sm:h-80 bg-muted rounded-lg">
                    <div className="text-center space-y-3 p-4">
                      <Camera className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm sm:text-base text-muted-foreground">Camera not active</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Click "Start Scanning" to activate camera</p>
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {processing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Scan Result */}
              {lastResult && !lastResult.success && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base text-red-900">
                        {lastResult.message}
                      </p>
                      {lastResult.attendee && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {lastResult.attendee.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2 sm:gap-3">
                {!isScanning ? (
                  <Button 
                    onClick={startScanning} 
                    className="flex-1 h-12 sm:h-11 touch-manipulation text-base" 
                    size="lg"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="destructive"
                    className="flex-1 h-12 sm:h-11 touch-manipulation text-base"
                    size="lg"
                  >
                    Stop Scanning
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;
