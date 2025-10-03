import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: string;
  eventTitle: string;
  userName: string;
}

const QRCodeDisplay = ({ qrCode, eventTitle, userName }: QRCodeDisplayProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `event-qr-${qrCode}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event QR Code - ${eventTitle}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            h1 { font-size: 24px; margin-bottom: 10px; }
            p { font-size: 16px; color: #666; margin: 5px 0; }
            .qr-code { margin: 20px 0; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${eventTitle}</h1>
            <p><strong>${userName}</strong></p>
            <div class="qr-code">${svgData}</div>
            <p>Show this QR code at the event entrance</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Your Event QR Code</h3>
          <p className="text-muted-foreground">
            Show this QR code at the event for check-in and raffle entry
          </p>
        </div>

        <div ref={qrRef} className="flex justify-center bg-white p-6 rounded-lg inline-block mx-auto">
          <QRCodeSVG 
            value={qrCode} 
            size={256}
            level="H"
            includeMargin
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">Code: {qrCode.slice(0, 8)}...</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={handleDownload} variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">💡 Important:</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            <li>• Save or screenshot this QR code</li>
            <li>• You can access it anytime from the event page</li>
            <li>• Present it at the event entrance for check-in</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default QRCodeDisplay;
