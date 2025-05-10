'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRScanner } from '@/components/qr/qr-scanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QRCodeData {
  e: string; // eventId
  t: string; // tokenId
  id: string; // qrCodeId
  k: string; // secretKey
}

export default function ScanPage() {
  const { publicKey, connected, signTransaction } = useWallet();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenClaimed, setTokenClaimed] = useState(false);
  const [tokenData, setTokenData] = useState<{
    name?: string;
    symbol?: string;
    eventName?: string;
  }>({});

  const handleScan = async (scannedData: string) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Parse the QR code data
      const data = JSON.parse(scannedData) as QRCodeData;

      setIsProcessing(true);

      // In a real implementation using Solana program, we'd do:
      // import { claimToken, deriveEventPDA, deriveQRCodePDA } from '~/lib/solana-program';
      // import { PublicKey } from '@solana/web3.js';
      //
      // 1. Derive the event and QR PDAs
      // const eventPDA = new PublicKey(data.e);
      //
      // 2. Convert the secretKey from base64 back to Uint8Array
      // const secretKeyString = atob(data.k);
      // const secretKey = new Uint8Array(secretKeyString.length);
      // for (let i = 0; i < secretKeyString.length; i++) {
      //   secretKey[i] = secretKeyString.charCodeAt(i);
      // }
      //
      // 3. Call the Solana program to claim the token
      // const txSignature = await claimToken(wallet, eventPDA, data.id, secretKey);
      //
      // 4. Call our API to store the claim in the database
      // await api.post('/api/tokens/claim', {
      //   qrCodeId: data.id,
      //   tokenId: data.t,
      //   txSignature
      // });

      // Simulate API and blockchain calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, we'd fetch the token data from our API or the blockchain
      // For now, we'll use mock data
      setTokenData({
        name: 'Hackathon Participant Token',
        symbol: 'HPT',
        eventName: 'Solana Hackathon 2025',
      });

      setTokenClaimed(true);
      toast.success('Token claimed successfully!');
    } catch (error) {
      console.error('Error claiming token:', error);
      toast.error('Failed to claim token. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
        <p className="mb-8 text-muted-foreground">Connect your wallet to scan and claim cTokens.</p>
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <p className="mb-4">Please connect your wallet to continue</p>
              <p className="text-sm text-muted-foreground">You need to connect a wallet to scan QR codes and claim tokens.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
        <p className="mb-8 text-muted-foreground">
          Scan a QR code to claim your proof-of-participation token.
        </p>

        {tokenClaimed ? (
          <Card>
            <CardHeader>
              <CardTitle>Token Claimed!</CardTitle>
              <CardDescription>
                You've successfully claimed your participation token.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-lg mb-1">{tokenData.name}</h3>
                  <p className="text-sm text-muted-foreground">Symbol: {tokenData.symbol}</p>
                  <p className="text-sm text-muted-foreground">Event: {tokenData.eventName}</p>
                </div>

                <p className="text-sm">
                  This compressed token (cToken) has been added to your wallet. It can be viewed in the "My Tokens" section.
                </p>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTokenClaimed(false);
                      setTokenData({});
                    }}
                  >
                    Scan Another
                  </Button>
                  <Button onClick={() => window.location.href = '/my-tokens'}>
                    View My Tokens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Use your camera to scan a QR code and claim your token
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <QRScanner
                  onScan={handleScan}
                  onClose={() => setIsScanning(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Make sure you have your wallet connected before scanning.
                    Position the QR code clearly in front of your camera.
                  </p>

                  <Button
                    onClick={() => setIsScanning(true)}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Start Scanning'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">How does this work?</summary>
            <div className="mt-2 p-4 bg-muted/50 rounded-lg">
              <p className="mb-2">When you scan a QR code:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Your wallet sends a claim request to the Solana blockchain</li>
                <li>The request includes zero-knowledge proofs to validate your claim</li>
                <li>A compressed token (cToken) is minted and assigned to your wallet</li>
                <li>The QR code becomes inactive to prevent double claims</li>
              </ol>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
