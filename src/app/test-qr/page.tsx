"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { generateQrCodeDataUrl, createSolanaPayClaimUrl } from '@/lib/utils/qrcode';
import { PublicKey } from '@solana/web3.js';

export default function TestQRPage() {
  const [mintAddress, setMintAddress] = useState<string>('');
  const [eventName, setEventName] = useState<string>('TestEvent');
  const [qrSize, setQrSize] = useState<number>(250);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  // Sample mint addresses for quick testing
  const sampleMints = [
    '7XsC1QcXRDRCUD7XxRuu1QG7eo2yDqTJoPhc8iJgUJ2e',
    'EApX1JPvEEnzXduWPCw9CjSqqCfrJUfTRM8HUv6bnqwm',
    '6G7eztfbXJan2iF6fzd2Sjkw6TyXhx9L5EE2GityZ8Dg'
  ];

  const generateQR = async () => {
    try {
      setError(null);

      if (!mintAddress) {
        setError('Please enter a mint address');
        return;
      }

      // Validate mint address
      try {
        new PublicKey(mintAddress);
      } catch (err) {
        setError('Invalid mint address format');
        return;
      }

      // Create a dummy recipient public key for testing
      const dummyRecipient = new PublicKey('F6CXpkFqabazi6LcfFLkwbQdqSVBNUAVWuEqe2mdE9DK');

      // Generate Solana Pay URL
      const solanaPayUrl = createSolanaPayClaimUrl(
        dummyRecipient,
        new PublicKey(mintAddress),
        eventName,
        `Claim your test token for ${eventName}`
      );

      setLastGeneratedUrl(solanaPayUrl);

      // Generate QR code
      const qrCodeDataUrl = await generateQrCodeDataUrl(solanaPayUrl, qrSize);
      setQrCodeUrl(qrCodeDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">QR Code Testing Utility</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Code Generator */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Test QR Code</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="mintAddress">Token Mint Address</Label>
              <Input
                id="mintAddress"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Enter mint public key"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Test Event"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="qrSize">QR Code Size: {qrSize}px</Label>
              <Slider
                id="qrSize"
                value={[qrSize]}
                onValueChange={(value) => setQrSize(value[0])}
                min={100}
                max={500}
                step={10}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {sampleMints.map((mint, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMintAddress(mint)}
                >
                  Sample {index + 1}
                </Button>
              ))}
            </div>

            <Button onClick={generateQR} className="w-full">
              Generate QR Code
            </Button>

            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}
          </div>
        </Card>

        {/* QR Code Display with Lighting Conditions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test QR Code</h2>

          {qrCodeUrl ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="brightness">Brightness: {brightness}%</Label>
                <Slider
                  id="brightness"
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  min={20}
                  max={180}
                  step={10}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contrast">Contrast: {contrast}%</Label>
                <Slider
                  id="contrast"
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  min={20}
                  max={180}
                  step={10}
                  className="mt-2"
                />
              </div>

              <div className="border border-border p-4 rounded-lg flex justify-center">
                <div
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    transition: 'filter 0.3s ease',
                    backgroundColor: brightness < 50 ? '#333' : 'transparent',
                    padding: brightness < 50 ? '20px' : '0'
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="Test QR Code"
                    width={qrSize}
                    height={qrSize}
                    className="transition-transform hover:scale-105"
                  />
                </div>
              </div>

              {lastGeneratedUrl && (
                <div className="mt-4">
                  <Label htmlFor="urlOutput">Generated Solana Pay URL:</Label>
                  <div className="bg-muted p-2 rounded text-xs overflow-x-auto mt-1">
                    <code className="break-all">{lastGeneratedUrl}</code>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('/claim', '_blank')}
                >
                  Open Claim Page (to scan QR)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (qrCodeUrl) {
                      const link = document.createElement('a');
                      link.href = qrCodeUrl;
                      link.download = 'test-qr-code.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  Download QR Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center p-10 text-muted-foreground">
              <p>Generate a QR code to test different conditions</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">QR Code Testing Guide</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Testing Different Lighting Conditions:</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
              <li>Use the brightness and contrast sliders to simulate different lighting conditions</li>
              <li>Low brightness simulates scanning in dark environments</li>
              <li>High brightness simulates glare or overexposed situations</li>
              <li>Adjust contrast to simulate different screen qualities</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Testing Different Sizes:</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
              <li>Use the QR size slider to test scanning at different sizes</li>
              <li>Smaller QR codes (below 200px) may be harder to scan at a distance</li>
              <li>Very large QR codes might not fit entirely in the camera view</li>
              <li>Test at different distances from your device's camera</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Testing Process:</h3>
            <ol className="list-decimal pl-5 text-muted-foreground space-y-1 mt-2">
              <li>Generate a QR code with one of the sample mint addresses</li>
              <li>Adjust size, brightness, and contrast to test specific conditions</li>
              <li>Click "Open Claim Page" to start the scanner</li>
              <li>Position your device to scan the generated QR code</li>
              <li>Document any failures or successes for different configurations</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
