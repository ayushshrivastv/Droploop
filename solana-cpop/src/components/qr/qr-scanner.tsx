'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);

  const handleScan = (detectedCodes: any) => {
    if (detectedCodes && detectedCodes.length > 0) {
      try {
        const scannedData = detectedCodes[0]?.rawValue;
        if (scannedData) {
          setScanning(false);
          onScan(scannedData);
        } else {
          console.warn('QR code detected but rawValue is empty.');
          toast.info('QR code detected but no data found. Try again.');
        }
      } catch (error) {
        console.error('Error processing QR code data:', error);
        toast.error('Error processing QR data. Please try again.');
      }
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    toast.error('Error accessing camera. Please check your permissions.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">Scan QR Code</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Position the QR code in the scanner to claim your token.
        </p>

        <div className="relative aspect-square max-w-[300px] mx-auto overflow-hidden rounded-lg border mb-4">
          {scanning && (
            <Scanner
              constraints={{ facingMode: 'environment' }}
              onScan={handleScan}
              onError={handleError}
              scanDelay={500}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { width: '100%', height: '100%' },
              }}
            />
          )}
          {!scanning && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">
              <p>QR Code Detected</p>
            </div>
          )}
          <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none" />
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setScanning(true);
            }}
            disabled={scanning}
          >
            Scan Again
          </Button>
        </div>
      </div>
    </div>
  );
}
