'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRGenerator } from '@/components/qr/qr-generator';
import { toast } from 'sonner';

// Mock event data
const mockEvent = {
  id: 'event_123456789',
  name: 'Solana Hackathon 2025',
  description: 'Join us for the largest Solana hackathon of the year, featuring workshops, speakers, and exciting challenges.',
  location: 'Virtual Event',
  startDate: '2025-05-15T09:00:00Z',
  endDate: '2025-05-18T18:00:00Z',
  creator: 'John Doe',
};

// Mock token data
const mockToken = {
  id: 'token_987654321',
  name: 'Hackathon Participant Token',
  symbol: 'HPT',
  description: 'This token certifies participation in the Solana Hackathon 2025.',
  maxSupply: 1000,
  claimedCount: 48,
};

interface QRCodeRecord {
  id: string;
  createdAt: string;
  claimed: boolean;
}

export default function EventQRCodesPage({ params }: { params: { id: string } }) {
  const { publicKey, connected } = useWallet();
  const [qrCodes, setQrCodes] = useState<QRCodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading existing QR codes
    const loadQrCodes = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockQrCodes = Array(5).fill(null).map((_, i) => ({
          id: `qr_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          claimed: Math.random() > 0.5,
        }));

        setQrCodes(mockQrCodes);
      } catch (error) {
        console.error('Error loading QR codes:', error);
        toast.error('Failed to load QR codes');
      } finally {
        setIsLoading(false);
      }
    };

    loadQrCodes();
  }, []);

  const handleGenerateQrCode = (qrCodeId: string) => {
    const newQrCode: QRCodeRecord = {
      id: qrCodeId,
      createdAt: new Date().toISOString(),
      claimed: false,
    };

    setQrCodes(prev => [newQrCode, ...prev]);
  };

  if (!connected) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Event QR Codes</h1>
        <p className="mb-8 text-muted-foreground">Connect your wallet to manage event QR codes.</p>
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <p className="mb-4">Please connect your wallet to continue</p>
              <p className="text-sm text-muted-foreground">You need to connect a wallet to manage QR codes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{mockEvent.name}</h1>
            <p className="text-muted-foreground">Manage QR codes for this event</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Event
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>QR Codes</CardTitle>
                <CardDescription>
                  Generate and manage QR codes for participants to scan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Token Details</h3>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {mockToken.claimedCount} / {mockToken.maxSupply} claimed
                      </span>
                    </div>
                    <p className="text-sm mb-1">{mockToken.name} ({mockToken.symbol})</p>
                    <p className="text-sm text-muted-foreground">{mockToken.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Generated QR Codes</h3>
                      <span className="text-sm text-muted-foreground">
                        {qrCodes.length} total
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="text-center p-8">
                        <p>Loading QR codes...</p>
                      </div>
                    ) : qrCodes.length === 0 ? (
                      <div className="text-center p-8 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground">No QR codes generated yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {qrCodes.map(qr => (
                          <div key={qr.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{qr.id}</p>
                              <p className="text-xs text-muted-foreground">
                                Created {new Date(qr.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                qr.claimed
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              }`}>
                                {qr.claimed ? 'Claimed' : 'Unclaimed'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <QRGenerator
              eventId={params.id}
              tokenId={mockToken.id}
              onGenerate={handleGenerateQrCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
