'use client';

import { useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface QRGeneratorProps {
  eventId: string;
  tokenId: string;
  onGenerate?: (qrCodeId: string) => void;
}

export function QRGenerator({ eventId, tokenId, onGenerate }: QRGeneratorProps) {
  const [qrData, setQrData] = useState('');
  const [qrCodeId, setQrCodeId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQrCode = async () => {
    setIsGenerating(true);
    try {
      // In a real implementation, this would call the API to create a QR code record
      // and generate a unique ID and secret key for the QR code
      const newQrCodeId = `qr_${Math.random().toString(36).substr(2, 9)}`;
      const secretKey = Math.random().toString(36).substr(2, 16);

      // Create QR code data as a JSON string
      const data = JSON.stringify({
        e: eventId,
        t: tokenId,
        id: newQrCodeId,
        k: secretKey,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setQrCodeId(newQrCodeId);
      setQrData(data);

      if (onGenerate) {
        onGenerate(newQrCodeId);
      }

      toast.success('QR Code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQrCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qr-code-${qrCodeId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Participation QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center p-4">
          {qrData ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  id="qr-code"
                  value={qrData}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  QR Code ID: {qrCodeId}
                </p>
                <Button onClick={downloadQrCode} variant="outline" className="mr-2">
                  Download QR Code
                </Button>
                <Button onClick={() => setQrData('')}>
                  Generate New
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
              <p className="text-sm text-muted-foreground text-center">
                Generate a unique QR code for event participants to scan.
                Each QR code can be used for a single claim.
              </p>
              <Button
                onClick={generateQrCode}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
