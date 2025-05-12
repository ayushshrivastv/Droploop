/**
 * @file qr-scanner.tsx
 * @description QR code scanner component for the claim page
 * This component uses the html5-qrcode library to scan QR codes via the device camera
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseReferralData } from '@/lib/utils/referral-qrcode';

interface QRScannerProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onCodeScanned, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  useEffect(() => {
    // Initialize scanner
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    // Clean up on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Error stopping scanner:", error);
        });
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;

    setError(null);
    setIsScanning(true);

    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionGranted(true);

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Process the scanned code
        try {
          // Try to parse as a referral code
          const referralData = parseReferralData(decodedText);
          
          if (referralData && referralData.referralCode) {
            // If it's a valid referral code, pass it to the parent component
            onCodeScanned(referralData.referralCode);
            stopScanner();
          } else {
            // If it's not a valid referral URL but might be a direct address
            onCodeScanned(decodedText);
            stopScanner();
          }
        } catch (error) {
          console.error("Error processing QR code:", error);
          setError("Invalid QR code format. Please try again.");
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // This callback is triggered for non-fatal errors during scanning
          console.log(errorMessage);
        }
      );
    } catch (err) {
      setIsScanning(false);
      setError("Camera access denied or not available. Please check your browser permissions.");
      console.error("Error starting QR scanner:", err);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(error => {
        console.error("Error stopping scanner:", error);
      });
    }
  };

  return (
    <Card className="p-4 w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Scan Referral QR Code</h3>
        <p className="text-sm text-muted-foreground">
          Position the QR code within the scanner frame
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-gray-100 text-gray-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <div 
          id={scannerContainerId} 
          className="w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center"
        >
          {!isScanning && !permissionGranted && (
            <div className="text-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Click "Start Scanner" to activate your camera</p>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-gray-500 rounded-lg opacity-70"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4 gap-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        
        {!isScanning ? (
          <Button 
            onClick={startScanner}
            className="flex-1 bg-gray-500 hover:bg-gray-700 text-white"
          >
            Start Scanner
          </Button>
        ) : (
          <Button 
            onClick={stopScanner}
            variant="destructive"
            className="flex-1"
          >
            Stop Scanner
          </Button>
        )}
      </div>
    </Card>
  );
}
