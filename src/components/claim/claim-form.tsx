/**
 * @file claim-form.tsx
 * @description ClaimForm component for enabling users to join via referral and claim their Droploop tokens
 * This component handles referral processing via direct input of a referral code or through QR code scanning.
 * It integrates with Light Protocol for compressed token transfers and provides user feedback throughout
 * the joining process, rewarding both the referrer and the new user.
 */

"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useSafeWallet } from '@/hooks/use-safe-wallet';
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
import { QRScanner } from './qr-scanner';
import { parseReferralData } from '@/lib/utils/referral-qrcode';

/**
 * ClaimForm Component
 * Handles the token claiming process, supporting both direct input and URL-based claiming
 */
export function ClaimForm() {
  // Access to the user's Solana wallet
  const wallet = useSafeWallet();
  const { publicKey, connected, signTransaction, sendTransaction } = wallet || {};
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

  // New state variables for QR Scanner and Airdrop mode
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isAirdropMode, setIsAirdropMode] = useState(false);

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

  // Handler for QR code scanned
  const handleQRCodeScanned = (code: string) => {
    const parsedData = parseReferralData(code);
    if (parsedData && parsedData.referralCode) {
      setClaimCode(parsedData.referralCode);
      // If campaign details are present in the QR, use them
      if (parsedData.campaignId && parsedData.campaignName) {
        try {
          new PublicKey(parsedData.campaignId); // Validate mint/campaignId as PublicKey
          setEventDetails({ name: parsedData.campaignName, mint: parsedData.campaignId });
        } catch (err) {
          console.warn("Scanned QR code contained campaign info, but ID was not a valid PublicKey. Using code directly.", err);
          setEventDetails(null); // Fallback to just using the code
        }
      } else {
        // If no campaign details in QR, clear any existing eventDetails from URL params
        setEventDetails(null);
      }
    } else {
      // If not parsable as referral data (e.g., direct address), use the raw code
      setClaimCode(code);
      setEventDetails(null); // Clear event details if it's a direct code/address
    }
    setShowQRScanner(false); // Hide scanner after processing
  };

  // Toggle Airdrop Mode
  const toggleAirdropMode = () => {
    setIsAirdropMode(!isAirdropMode);
    setClaimCode(''); // Clear claim code when switching modes
    setError(null);   // Clear any previous errors
    
    if (!isAirdropMode) { // Just switched TO airdrop mode
      setEventDetails(null); // Clear URL-based event details for airdrop
    } else { // Just switched FROM airdrop mode (back to referral)
      // Re-evaluate URL params for event details if present
      const event = searchParams.get('event');
      const mint = searchParams.get('mint');
      if (event && mint) {
        try {
          new PublicKey(mint);
          setEventDetails({ name: decodeURIComponent(event), mint: mint });
        } catch (err) {
          setError('Invalid token information in URL after switching mode');
        }
      } else {
        setEventDetails(null); // Ensure eventDetails is null if no URL params
      }
    }
  };

  // Get the airdrop mint address from environment variables
  // This allows for easy configuration without changing code
  const AIRDROP_MINT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Default to USDC mint address

  /**
   * Handles the form submission for token claiming
   * Performs validation, creates a connection to Solana, and executes the token transfer
   * 
   * @param e - Form event object
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!connected || !publicKey) {
      setError('Please connect your wallet.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setClaimSuccess(false);

    let tokenToClaimAddress: string;
    let referralCodeForTx: string | null = null;
    let finalEventDetailsForSuccessView = eventDetails; // Default to existing eventDetails

    if (isAirdropMode) {
      if (!AIRDROP_MINT_ADDRESS || AIRDROP_MINT_ADDRESS === 'ENTER_AIRDROP_MINT_ADDRESS_HERE') {
        setError('Airdrop mint address is not configured. Please contact an administrator.');
        setIsSubmitting(false);
        return;
      }
      tokenToClaimAddress = AIRDROP_MINT_ADDRESS;
      // For airdrop success message, create/override eventDetails
      finalEventDetailsForSuccessView = { name: "Community Airdrop", mint: AIRDROP_MINT_ADDRESS };
      // No referral code needed for airdrop claim transaction itself
    } else { // Referral mode
      if (!claimCode && !eventDetails?.mint) {
        setError('Please enter a referral code or ensure event/campaign details are loaded (e.g., via QR or URL).');
        setIsSubmitting(false);
        return;
      }

      if (eventDetails?.mint) {
        tokenToClaimAddress = eventDetails.mint;
        referralCodeForTx = claimCode; // Use claimCode as the referral identifier
        finalEventDetailsForSuccessView = eventDetails; // Already set as default
      } else if (claimCode) {
        // Fallback: if no eventDetails, assume claimCode might be the mint address itself
        try {
          new PublicKey(claimCode); // Validate if claimCode is a PublicKey
          tokenToClaimAddress = claimCode;
          // No separate referral code if claimCode is used as mint
          finalEventDetailsForSuccessView = { name: "Direct Token Claim", mint: claimCode }; 
        } catch (err) {
          setError('Invalid referral code or mint address format. If claiming directly, ensure it is a valid address.');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Should be caught by the initial check, but as a safeguard:
        setError('Cannot determine the token to claim. Missing referral code and event details.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      console.log('Initiating transfer with:', {
        tokenMintAddress: tokenToClaimAddress,
        recipientPublicKey: publicKey.toBase58(),
        referralCodeOrAddress: referralCodeForTx,
        isAirdrop: isAirdropMode,
      });

      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || DEVNET_RPC_ENDPOINT;
      const appConfig = { 
        rpcEndpoint,
        cluster: process.env.NEXT_PUBLIC_CLUSTER as "devnet" | "mainnet-beta" | "testnet" | "localnet" || DEFAULT_CLUSTER
      };
      const connection = createConnection(appConfig);

      const privateKeyString = process.env.NEXT_PUBLIC_SENDER_PRIVATE_KEY;
      if (!privateKeyString) {
        setError("Sender private key is not configured in environment variables. Please contact an administrator or set NEXT_PUBLIC_SENDER_PRIVATE_KEY.");
        setIsSubmitting(false);
        return;
      }

      let senderKeypair: Keypair;
      try {
        // Assuming the private key is stored as a base58 encoded string of the secret key (64 bytes)
        // Or, if it's a stringified byte array, use: Uint8Array.from(JSON.parse(privateKeyString))
        // For simplicity, let's assume bs58 encoded secret key for now.
        // WalletAdapter.fromSecretKey() is not directly available, must use Keypair.fromSecretKey
        const bs58 = await import('bs58'); // Dynamically import bs58
        senderKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyString));
      } catch (keyError) {
        console.error("Error deriving sender keypair from private key:", keyError);
        setError("Invalid sender private key format in environment variables. Ensure it's a valid base58 encoded secret key.");
        setIsSubmitting(false);
        return;
      }

      const signature = await transferCompressedTokens(
        connection,
        senderKeypair, // Payer for the transaction fees
        new PublicKey(tokenToClaimAddress), // The token mint address to claim
        1, // Amount to transfer (typically 1 for NFT/POP token)
        senderKeypair, // Owner of the token (in production, this would be the event organizer's wallet)
        publicKey // Destination (the user's connected wallet)
      );
      console.log('Transaction successful with signature:', signature);
      
      // Update eventDetails state for the success view before setting success flag
      setEventDetails(finalEventDetailsForSuccessView); 
      setClaimSuccess(true);
      setClaimCode(''); // Clear claim code after successful claim

    } catch (err: any) {
      // Handle and display any errors during the claim process
      console.error("Error claiming token:", err);
      setError(`Error claiming token: ${err instanceof Error ? err.message : String(err)}`);
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
          <CardTitle className="text-center text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {eventDetails?.name?.toLowerCase().includes('airdrop') ? 'Airdrop Claimed Successfully!' : 'Token Claimed Successfully!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-6 animate-slide-up" style={{animationDelay: '100ms'}}>
            <div className="bg-gray-50 rounded-full p-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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

  // If QR Scanner is active, show it
  if (showQRScanner) {
    return (
      <QRScanner 
        onCodeScanned={handleQRCodeScanned} 
        onClose={() => setShowQRScanner(false)} 
      />
    );
  }

  // Default view: Claim form
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            {isAirdropMode ? 'Claim Airdrop' : 'Claim Referral Reward'}
          </div>
          <Button variant="outline" size="sm" onClick={toggleAirdropMode} className="text-xs">
            {isAirdropMode ? 'Switch to Referral' : 'Switch to Airdrop'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {eventDetails && !isAirdropMode ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-black/20 rounded-lg shadow-sm transition-all hover:shadow-md backdrop-blur-sm border border-gray-500/20">
              <p className="font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                Referral Campaign: {eventDetails.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447-.894l4-12a1 1 0 010 1.788l-4 12a1 1 0 01-1.447-.894L9 15.354m-5 6H2a1 1 0 01-1-1v-4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1z" clipRule="evenodd" />
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
              <p className="text-xs text-muted-foreground mt-2">
                Light Protocol ensures ultra-low gas fees through ZK compression
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAirdropMode ? (
              <div className="space-y-2">
                <Label htmlFor="claimCode" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a3.066 3.066 0 001.745-.894l4 12a1 1 0 010 1.788l-4 12a3.066 3.066 0 01-5.434 0l-4-12A3.066 3.066 0 013.001 8.22L8.12 3.45a3.066 3.066 0 015.434 0z" clipRule="evenodd" />
                  </svg>
                  Referral Code
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="claimCode"
                    placeholder="Enter referral code or scan QR"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    required={!isAirdropMode} // Only required if not in airdrop mode
                    className="bg-black/20 border-gray-500/20 placeholder:text-zinc-500 flex-grow"
                  />
                  <Button 
                    type="button" // Important: type="button" to prevent form submission
                    variant="outline" 
                    onClick={() => setShowQRScanner(true)}
                    className="px-3"
                    aria-label="Scan QR Code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4.586A1 1 0 019.293 3.707L10 4.414l.707-.707A1 1 0 0111.414 3H16a1 1 0 011 1v4.586A1 1 0 0116.293 9.293L15.586 10l.707.707A1 1 0 0117 11.414V16a1 1 0 01-1 1h-4.586A1 1 0 0110.707 16.293L10 15.586l-.707.707A1 1 0 018.586 17H4a1 1 0 01-1-1v-4.586A1 1 0 013.707 10.707L4.414 10l-.707-.707A1 1 0 013 8.586V4zm2 2V4h2v2H5zm0 4V8h2v2H5zm0 4v-2h2v2H5zm4-8V4h2v2h-2zm0 4V8h2v2h-2zm0 4v-2h2v2H9zm4-8V4h2v2h-2zm0 4V8h2v2h-2z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Use the code from your friend's referral, paste an address, or scan QR.
                </p>
              </div>
            ) : (
              // Airdrop mode indication
              <div className="text-center p-4 bg-black/20 rounded-lg shadow-sm backdrop-blur-sm border border-gray-500/20">
                <h3 className="text-lg font-semibold mb-2">Airdrop Mode Active</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet and click "Claim Airdrop" below to receive your tokens.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  (Ensure the airdrop mint address is correctly configured by the admin.)
                </p>
              </div>
            )}
            
            {!isAirdropMode && (
            <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-gray-500/10">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.894l4 12a1 1 0 010 1.788l-4 12a3.066 3.066 0 01-5.434 0l-4-12A3.066 3.066 0 013.001 8.22L8.12 3.45a3.066 3.066 0 015.434 0z" clipRule="evenodd" />
                </svg>
                ZK Compression Benefits
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  99.9% lower gas fees than regular tokens
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Privacy-preserving referral tracking
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Instant reward distribution to both parties
                </li>
              </ul>
            </div>
            )}
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || !connected || (isAirdropMode ? false : (!claimCode && !eventDetails))}
          className="relative px-8 py-2 bg-white hover:bg-gray-100 text-black rounded-full shadow-lg hover:shadow-white/20 transition-all duration-300 w-full md:w-auto"
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              {isAirdropMode ? 'Claim Airdrop' : 'Claim Referral'}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
