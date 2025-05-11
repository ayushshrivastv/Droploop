/**
 * @file claim-form.tsx
 * @description ClaimForm component for enabling users to join via referral and claim their Droploop tokens
 * This component handles referral processing via direct input of a referral code or through QR code scanning.
 * It integrates with Light Protocol for compressed token transfers and provides user feedback throughout
 * the joining process, rewarding both the referrer and the new user.
 */

"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { transferCompressedTokens, createConnection } from '@/lib/utils/solana';
import { DEFAULT_CLUSTER, DEVNET_RPC_ENDPOINT } from '@/lib/constants';
import { Keypair } from '@solana/web3.js';

/**
 * ClaimForm Component
 * Handles the token claiming process, supporting both direct input and URL-based claiming
 */
export function ClaimForm() {
  // Access to the user's Solana wallet
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  // Get URL parameters (used for direct claim links)
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Component state
  /** Stores the claim code or token address entered by the user */
  const [claimCode, setClaimCode] = useState('');
  /** Tracks the submission status for UI feedback */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Indicates if the claim was successful */
  const [claimSuccess, setClaimSuccess] = useState(false);
  /** Stores any error messages to display to the user */
  const [error, setError] = useState<string | null>(null);
  /** Stores event information extracted from URL parameters */
  const [eventDetails, setEventDetails] = useState<{
    name: string;  // Event name
    mint: string;  // Token mint address
  } | null>(null);

  /**
   * Effect hook to process URL parameters when the component loads
   * Extracts event name and token mint address from the URL and validates them
   */
  useEffect(() => {
    const event = searchParams.get('event');
    const mint = searchParams.get('mint');
    
    if (event && mint) {
      try {
        // Validate that the mint address is a valid Solana public key
        new PublicKey(mint);
        
        // Store the event details for display and processing
        setEventDetails({
          name: decodeURIComponent(event),
          mint: mint
        });
        
        // Auto-populate claim code if provided in URL
        // This enables direct claiming from QR codes
        const code = searchParams.get('code');
        if (code) {
          setClaimCode(code);
        }
      } catch (err) {
        // Handle invalid mint address format
        setError('Invalid token information in URL');
      }
    }
  }, [searchParams]);

  /**
   * Handles the form submission for token claiming
   * Performs validation, creates a connection to Solana, and executes the token transfer
   * 
   * @param e - Form event object
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify wallet connection
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Ensure we have a claim code or event details
    if (!eventDetails && !claimCode) {
      setError('Please enter a claim code');
      return;
    }
    
    try {
      // Reset previous errors and indicate processing has started
      setError(null);
      setIsSubmitting(true);
      
      // Get the mint address either from the URL parameters or the claim code input
      const mintAddress = eventDetails?.mint || claimCode;
      
      // Validate the mint address is a valid Solana PublicKey
      let mintPublicKey;
      try {
        mintPublicKey = new PublicKey(mintAddress);
      } catch (err) {
        throw new Error('Invalid token address format');
      }
      
      // Log claiming details for debugging
      console.log("Claiming token with:", {
        mint: mintPublicKey.toBase58(),
        recipient: publicKey.toBase58()
      });
      
      // Set up connection to Solana with appropriate RPC endpoint
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || DEVNET_RPC_ENDPOINT;
      const appConfig = { 
        rpcEndpoint,
        cluster: process.env.NEXT_PUBLIC_CLUSTER as "devnet" | "mainnet-beta" | "testnet" | "localnet" || DEFAULT_CLUSTER
      };
      
      /**
       * IMPORTANT FOR PRODUCTION:
       * In a real production application, the token transfer should happen server-side
       * or through a different mechanism where private keys aren't exposed.
       * This demo uses a temporary keypair for illustration purposes only.
       */
      const senderKeypair = /*await window.solana.getSecretKey() or other secure method*/ new Keypair();
      
      // Execute the token transfer using Light Protocol
      const { signature } = await transferCompressedTokens(
        createConnection(appConfig),
        senderKeypair, // Payer for the transaction fees
        mintPublicKey, // The token mint address to claim
        1, // Amount to transfer (typically 1 for NFT/POP token)
        senderKeypair, // Owner of the token (in production, this would be the event organizer's wallet)
        publicKey // Destination (the user's connected wallet)
      );
      
      // Log successful transaction for debugging and user reference
      console.log("Token claimed successfully, signature:", signature);
      
      // Update UI to show success state
      setClaimSuccess(true);
    } catch (error) {
      // Handle and display any errors during the claim process
      console.error("Error claiming token:", error);
      setError(`Error claiming token: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      // Always reset submission state regardless of outcome
      setIsSubmitting(false);
    }
  };

  /**
   * Success view shown after a successful token claim
   * Provides user feedback and navigation options
   */
  if (claimSuccess) {
    return (
      <Card className="w-full card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-green-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Token Claimed Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-6 animate-slide-up" style={{animationDelay: '100ms'}}>
            <div className="bg-green-50 rounded-full p-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-lg mb-2">
            You have successfully claimed your token for:
          </p>
          <p className="font-semibold text-xl mb-6">
            {eventDetails?.name || "Event Token"}
          </p>
          <p className="text-sm text-muted-foreground">
            The token has been added to your wallet. You can view it in your profile.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 animate-slide-up" style={{animationDelay: '200ms'}}>
          <Button variant="outline" className="transition-all hover:bg-secondary" onClick={() => router.push('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          Claim Referral Reward
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {eventDetails ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-black/20 rounded-lg shadow-sm transition-all hover:shadow-md backdrop-blur-sm border border-purple-500/20">
              <p className="font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Referral Campaign: {eventDetails.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447-.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                Token: {eventDetails.mint.slice(0, 4)}...{eventDetails.mint.slice(-4)}
              </p>
            </div>
            
            <div className="text-center py-2 space-y-2 animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to claim your ZK-compressed token reward
              </p>
              <p className="text-xs text-muted-foreground/70">
                Light Protocol ensures ultra-low gas fees through ZK compression
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claimCode" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Referral Code
              </Label>
              <Input
                id="claimCode"
                placeholder="Enter referral code or scan QR code"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                required
                className="bg-black/20 border-purple-500/20 placeholder:text-zinc-500"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Use the code from your friend's referral or paste the full address
              </p>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-purple-500/10">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ZK Compression Benefits
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  99.9% lower gas fees than regular tokens
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Privacy-preserving referral tracking
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant reward distribution to both parties
                </li>
              </ul>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !connected}
          className="relative px-8 py-2 bg-white hover:bg-slate-100 text-black rounded-full shadow-lg hover:shadow-gray-200/25 transition-all duration-300"
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Claim...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Claim Referral
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
