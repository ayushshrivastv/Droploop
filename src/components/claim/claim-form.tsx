"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { transferCompressedTokens, createConnection, formatPublicKey } from '@/lib/utils/solana';
import { DEFAULT_CLUSTER, DEVNET_RPC_ENDPOINT } from '@/lib/constants';
import { QrScanner } from './qr-scanner';
import { toast } from 'sonner';

// Inner component that contains all wallet-dependent logic
function ClaimFormContent() {
  // Access to the user's Solana wallet
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  // Get URL parameters (used for direct claim links)
  const searchParams = useSearchParams();
  const router = useRouter();

  // Component state
  const [claimCode, setClaimCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState('');

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!claimCode.trim()) {
      setClaimError('Please enter a claim code or token address');
      return;
    }
    
    if (!connected || !publicKey) {
      setClaimError('Please connect your wallet first');
      return;
    }
    
    setIsSubmitting(true);
    setClaimError('');
    
    try {
      // Create sender keypair from environment variable
      const privateKeyString = process.env.NEXT_PUBLIC_SENDER_PRIVATE_KEY;
      
      if (!privateKeyString) {
        throw new Error('Sender private key not configured');
      }
      
      // Convert private key string to Uint8Array
      const privateKeyBytes = privateKeyString
        .split(',')
        .map(byte => parseInt(byte.trim()));
      
      const senderKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyBytes));
      
      // Create connection to Solana network
      const connection = createConnection({ rpcEndpoint: DEVNET_RPC_ENDPOINT, cluster: DEFAULT_CLUSTER });
      
      // Determine if claim code is a token address or a claim code
      let tokenAddress: string;
      
      if (claimCode.startsWith('http') || claimCode.includes('solana:')) {
        // Extract token address from Solana Pay URL
        const url = new URL(claimCode);
        tokenAddress = url.pathname.split('/').pop() || '';
        
        if (!tokenAddress) {
          throw new Error('Invalid Solana Pay URL: No token address found');
        }
      } else {
        // Use claim code directly as token address
        tokenAddress = claimCode;
      }
      
      // Validate token address format
      try {
        new PublicKey(tokenAddress);
      } catch (err) {
        throw new Error('Invalid token address format');
      }
      
      // Transfer the compressed token
      const tokenMint = new PublicKey(tokenAddress);
      const result = await transferCompressedTokens(
        connection,
        senderKeypair,  // payer
        tokenMint,      // mint
        1,              // amount (assuming 1 token per claim)
        senderKeypair,  // owner (same as payer in this case)
        publicKey       // destination
      );
      
      setTransactionSignature(result.signature);
      setClaimSuccess(true);
      toast.success('Token claimed successfully!');
    } catch (error) {
      console.error('Claim error:', error);
      setClaimError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to claim token');
    } finally {
      setIsSubmitting(false);
    }
  }, [claimCode, connected, publicKey]);

  // Handle QR scanner toggle
  const toggleQrScanner = useCallback(() => {
    setShowQrScanner(!showQrScanner);
  }, [showQrScanner]);

  // Handle QR code scan result
  const handleScanResult = useCallback((result: string) => {
    setClaimCode(result);
    setShowQrScanner(false);
    
    // Auto-submit after successful scan
    setTimeout(() => {
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }, 500);
  }, [handleSubmit]);

  // Check for URL parameters on component mount
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setClaimCode(code);
      // Auto-submit if code is provided via URL
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      
      // Add a slight delay to ensure wallet connection has time to initialize
      setTimeout(() => {
        handleSubmit(syntheticEvent);
      }, 1000);
    }
  }, [searchParams, connected, handleSubmit]);

  // Render success message if claim was successful
  if (claimSuccess) {
    return (
      <Card className="w-full card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Claim Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your token has been successfully claimed and transferred to your wallet.
          </p>
          <Alert className="mb-4">
            <AlertTitle>Transaction Details</AlertTitle>
            <AlertDescription className="mt-2 text-xs break-all">
              Signature: {transactionSignature}
            </AlertDescription>
          </Alert>
          {publicKey && (
            <Alert className="mb-4">
              <AlertTitle>Recipient Wallet</AlertTitle>
              <AlertDescription className="mt-2 text-xs break-all">
                {publicKey.toString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-black hover:bg-slate-100"
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full card-hover animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
          Claim Your Token
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showQrScanner ? (
          <div className="space-y-4">
            <QrScanner onScanSuccess={handleScanResult} onClose={() => setShowQrScanner(false)} />
            <Button 
              onClick={toggleQrScanner}
              className="w-full"
              variant="outline"
            >
              Cancel Scanning
            </Button>
          </div>
        ) : !showQrScanner ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claimCode">Claim Code or Token Address</Label>
              <div className="flex gap-2">
                <Input
                  id="claimCode"
                  placeholder="Enter claim code or paste token address"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={toggleQrScanner}
                  variant="outline"
                  className="flex items-center"
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Scan QR
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scan a Solana Pay QR code or enter a token address manually
              </p>
            </div>
          </form>
        ) : null}
        
        {claimError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{claimError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={(e) => handleSubmit(e as React.FormEvent)}
          disabled={isSubmitting || !connected}
          className="relative transition-all bg-white text-black hover:bg-slate-100"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Claim Token
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Outer component that handles client-side mounting
export function ClaimForm() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render a placeholder until component is mounted client-side
  if (!isMounted) {
    return (
      <Card className="w-full card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
            </svg>
            Claim Your Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Once mounted, render the full component with wallet functionality
  return <ClaimFormContent />;
}
