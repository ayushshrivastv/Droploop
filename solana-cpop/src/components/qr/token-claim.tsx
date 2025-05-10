import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { QRScanner } from './qr-scanner';
import { claimToken } from '@/lib/compression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface QRCodeData {
  eventId: string;
  qrCodeId: string;
  secretKey: string;
  eventAddress: string;
  merkleTreeAddress: string;
  creatorAddress: string;
}

export function TokenClaimComponent() {
  const { publicKey, signTransaction } = useWallet();
  const [scanning, setScanning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleScan = (data: string) => {
    try {
      // Parse QR code data
      const parsedData: QRCodeData = JSON.parse(data);
      setQrData(parsedData);
      setScanning(false);
      toast.success('QR code scanned successfully!');
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      toast.error('Invalid QR code format');
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !qrData || !signTransaction) {
      toast.error('Wallet not connected or QR data missing');
      return;
    }

    setClaiming(true);
    try {
      // Convert string addresses to PublicKey objects
      const eventPDA = new PublicKey(qrData.eventAddress);
      const merkleTreeAddress = new PublicKey(qrData.merkleTreeAddress);
      const creatorAddress = new PublicKey(qrData.creatorAddress);
      
      // Convert hex secret key to Uint8Array
      const secretKeyBytes = new Uint8Array(
        qrData.secretKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );

      // Call the claim token function
      const wallet = { publicKey, signTransaction };
      const signature = await claimToken(
        wallet,
        eventPDA,
        merkleTreeAddress,
        creatorAddress,
        qrData.qrCodeId,
        secretKeyBytes
      );

      setTxSignature(signature);
      setClaimSuccess(true);
      toast.success('Token claimed successfully!');
    } catch (error) {
      console.error('Error claiming token:', error);
      toast.error('Failed to claim token');
    } finally {
      setClaiming(false);
    }
  };

  const resetClaim = () => {
    setQrData(null);
    setTxSignature(null);
    setClaimSuccess(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Claim cPOP Token</CardTitle>
        <CardDescription>
          Scan a QR code to claim your proof of participation token
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!publicKey ? (
          <div className="text-center p-4 border rounded-md bg-slate-50">
            Please connect your wallet to claim tokens
          </div>
        ) : scanning ? (
          <div className="my-4">
            <QRScanner onScan={handleScan} />
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => setScanning(false)}
            >
              Cancel
            </Button>
          </div>
        ) : qrData ? (
          <div className="space-y-3 my-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Event ID:</p>
              <p className="text-sm font-mono truncate">{qrData.eventId}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">QR Code ID:</p>
              <p className="text-sm font-mono truncate">{qrData.qrCodeId}</p>
            </div>
            {claimSuccess && txSignature && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                <p className="text-sm font-medium text-green-600">Token claimed successfully!</p>
                <a 
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline truncate block mt-1"
                >
                  View transaction
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center my-8">
            <Button onClick={() => setScanning(true)}>
              Scan QR Code
            </Button>
          </div>
        )}
      </CardContent>
      {qrData && !claimSuccess && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetClaim}>
            Cancel
          </Button>
          <Button 
            onClick={handleClaim} 
            disabled={claiming}
          >
            {claiming ? 'Claiming...' : 'Claim Token'}
          </Button>
        </CardFooter>
      )}
      {claimSuccess && (
        <CardFooter>
          <Button className="w-full" onClick={resetClaim}>
            Claim Another Token
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
