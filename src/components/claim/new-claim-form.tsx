import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DEFAULT_CLUSTER, DEVNET_RPC_ENDPOINT, ROUTES } from '@/lib/constants';
import { QrScanner } from './qr-scanner';

/**
 * Extracts or validates the mint address from different input formats
 * @param input - The input which could be a URL, a claim code, or a direct token address
 * @returns The mint address or null if not found/invalid
 */
const extractOrValidateMintAddress = (input: string): string | null => {
  try {
    // First, try to validate if it's already a valid Solana address
    try {
      const pubkey = new PublicKey(input.trim());
      // If we can create a PublicKey without error, it's likely a valid Solana address
      console.log('Input is a valid Solana public key:', pubkey.toBase58());
      return pubkey.toBase58();
    } catch (pubkeyErr) {
      // Not a valid public key, continue with other checks
    }

    // Check if it's a Solana Pay URL (solana:recipient?spl-token=MINT_ADDRESS&...)
    if (input.startsWith('solana:')) {
      // Split by question mark to get the query string
      const parts = input.split('?');
      if (parts.length > 1) {
        // Create URLSearchParams from the query string
        const searchParams = new URLSearchParams(parts[1]);
        // Extract the spl-token parameter which contains the mint address
        const mintAddress = searchParams.get('spl-token');

        if (mintAddress) {
          console.log('Extracted mint address from Solana Pay URL:', mintAddress);
          return mintAddress;
        }
      }
      return null;
    }

    // For standard claim URLs or query parameters
    if (input.includes('?') || input.includes('=')) {
      try {
        // Check if the input is a full URL with origin
        let searchParams: URLSearchParams;
        try {
          const parsedUrl = new URL(input);
          searchParams = new URLSearchParams(parsedUrl.search);
        } catch (urlErr) {
          // Not a full URL, try parsing as query string directly
          searchParams = new URLSearchParams(input);
        }
        
        const mintAddress = searchParams.get('mint');
        if (mintAddress) {
          return mintAddress;
        }
      } catch (err) {
        console.error('Error parsing URL or query params:', err);
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error in extractOrValidateMintAddress:', err);
    return null;
  }
};

/**
 * ClaimForm Component
 * Handles the referral NFT claiming process, supporting both direct input and URL-based claiming
 */
export function ClaimForm({
  initialClaimCode = '',
  initialEvent = null,
  onClaimAttempt = undefined
}: {
  initialClaimCode?: string;
  initialEvent?: { name: string; mint: string } | null;
  onClaimAttempt?: (success: boolean, message: string) => void;
}) {
  // Access to the user's Solana wallet
  const { publicKey, connected, sendTransaction } = useWallet();
  // Get URL parameters (used for direct claim links)
  const searchParams = useSearchParams();
  const router = useRouter();

  // Component state
  const [claimCode, setClaimCode] = useState(initialClaimCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<{
    name: string;
    mint: string;
  } | null>(initialEvent);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  // Visual feedback stages
  const stages = [
    { id: 'validating', message: 'Validating referral NFT address...' },
    { id: 'connecting', message: 'Connecting to Solana network...' },
    { id: 'claiming', message: 'Processing referral claim...' },
    { id: 'confirming', message: 'Confirming transaction...' }
  ];

  /**
   * Effect hook to process URL parameters when the component loads
   */
  useEffect(() => {
    if (initialClaimCode || initialEvent) return; // Skip if props were provided

    const event = searchParams.get('event');
    const mint = searchParams.get('mint');

    if (event && mint) {
      try {
        // Validate mint address format
        new PublicKey(mint);

        // Store event details
        setEventDetails({
          name: decodeURIComponent(event),
          mint: mint
        });

        // Auto-populate claim code if provided in URL
        const code = searchParams.get('code');
        if (code) {
          setClaimCode(code);
        }
      } catch (err) {
        setError('Invalid token information in URL');
        if (onClaimAttempt) onClaimAttempt(false, 'Invalid token information in URL');
      }
    }
  }, [searchParams, initialClaimCode, initialEvent, onClaimAttempt]);

  /**
   * Handles the form submission for token claiming
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify wallet connection
    if (!connected || !publicKey) {
      const errMsg = 'Please connect your wallet first';
      setError(errMsg);
      if (onClaimAttempt) onClaimAttempt(false, errMsg);
      return;
    }

    // Ensure we have a claim code or event details
    if (!eventDetails && !claimCode) {
      const errMsg = 'Please enter a referral claim code';
      setError(errMsg);
      if (onClaimAttempt) onClaimAttempt(false, errMsg);
      return;
    }

    try {
      // Reset previous errors and indicate processing has started
      setError(null);
      setIsSubmitting(true);
      setProcessingStage('validating');

      // Get the mint address either from the URL parameters or the claim code input
      let mintAddress = eventDetails?.mint || claimCode.trim();

      // Process the input to extract or validate the token address
      if (mintAddress) {
        const processedMint = extractOrValidateMintAddress(mintAddress);
        if (processedMint) {
          mintAddress = processedMint;
          console.log('Using processed mint address:', mintAddress);
        } else if (mintAddress.startsWith('solana:') || mintAddress.includes('?') || mintAddress.includes('=')) {
          // Only show error for inputs that look like URLs or query strings but failed to parse
          const errMsg = 'Could not extract referral NFT address from the provided input';
          setError(errMsg);
          setIsSubmitting(false);
          setProcessingStage(null);
          if (onClaimAttempt) onClaimAttempt(false, errMsg);
          return;
        }
        // If it's not a URL format and didn't parse as a valid address, we'll
        // continue and let the PublicKey validation below catch any issues
      }

      // Try to create a PublicKey to validate the format
      let mintPublicKey: PublicKey;
      try {
        setProcessingStage('validating');
        mintPublicKey = new PublicKey(mintAddress);
        // If it gets here, the address is valid
      } catch (pubkeyError) {
        console.error('Invalid public key format:', pubkeyError);
        const errMsg = 'Invalid referral NFT address. Please enter a valid Solana address.';
        setError(errMsg);
        setIsSubmitting(false);
        setProcessingStage(null);
        if (onClaimAttempt) onClaimAttempt(false, errMsg);
        return;
      }

      // Connect to the server-side API to claim the referral NFT
      setProcessingStage('connecting');

      // Call our server API endpoint which handles the referral NFT transfer securely
      setProcessingStage('claiming');
      const response = await fetch('/api/token/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint: mintPublicKey.toBase58(),
          destination: publicKey.toBase58(),
        }),
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to claim referral NFT. Please try again.';
        throw new Error(errorMessage);
      }

      // Parse the response
      const result = await response.json();
      setProcessingStage('confirming');

      // Add a slight delay to show the confirmation stage
      await new Promise(resolve => setTimeout(resolve, 1000));

      setClaimSuccess(true);
      setProcessingStage(null);
      console.log('Referral NFT claimed successfully:', result.signature);
      if (onClaimAttempt) onClaimAttempt(true, `Referral NFT claimed successfully: ${result.signature}`);

    } catch (err) {
      console.error('Error claiming token:', err);
      const errMsg = err instanceof Error
        ? `Failed to claim referral NFT: ${err.message}`
        : 'Failed to claim referral NFT. Please check the address and try again.';
      setError(errMsg);
      setProcessingStage(null);
      if (onClaimAttempt) onClaimAttempt(false, errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful claim screen
  if (claimSuccess) {
    return (
      <Card className="w-full card-hover animate-fade-in">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-green-500/10 text-green-500 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium">Token Claim Successful!</h3>
              </div>
              <p>Your compressed NFT has been successfully transferred to your wallet.</p>
            </div>

            <Button
              onClick={() => router.push(ROUTES.HOME)}
              className="w-full bg-white text-black hover:bg-slate-100 transition-all"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
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
        {/* Processing Stages - New Visual Feedback */}
        {isSubmitting && processingStage && (
          <div className="mb-6 p-4 border rounded-md bg-gradient-to-r from-blue-950/40 to-purple-950/40">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Processing Claim</h3>
              <div className="animate-pulse text-primary text-xs">
                Processing...
              </div>
            </div>

            <div className="space-y-2">
              {stages.map((stage, index) => {
                const isActive = stage.id === processingStage;
                const isCompleted = stages.findIndex(s => s.id === processingStage) > index;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center p-2 rounded-md transition-all ${
                      isActive ? 'bg-primary/20 text-primary' :
                      isCompleted ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <div className="h-4 w-4 mr-2 rounded-full border border-muted-foreground/30" />
                    )}
                    <span className="text-sm">{stage.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QR Scanner Component - Only shown when showQrScanner is true */}
        {showQrScanner && (
          <div className="mb-6">
            <QrScanner
              onScanSuccess={(result) => {
                console.log('QR scan successful:', result);
                try {
                  // Check if it's a Solana Pay URL
                  if (result.startsWith('solana:')) {
                    // Extract parameters from Solana Pay URL
                    const extractedMint = extractOrValidateMintAddress(result);

                    if (extractedMint) {
                      try {
                        // Validate the mint address
                        new PublicKey(extractedMint);

                        // Set claim code to the extracted mint address
                        setClaimCode(extractedMint);

                        // Extract other parameters if available
                        const parts = result.split('?');
                        let label: string | null = null;
                        if (parts.length > 1) {
                          const params = new URLSearchParams(parts[1]);
                          label = params.get('label');
                        }

                        if (label) {
                          setEventDetails({
                            name: decodeURIComponent(label),
                            mint: extractedMint
                          });
                        }

                        // Close the scanner
                        setShowQrScanner(false);

                        // If we have everything we need, submit automatically
                        if (connected && publicKey) {
                          setTimeout(() => {
                            // Create a synthetic event object that's compatible with our handler
                            const syntheticEvent = {
                              preventDefault: () => {}
                            } as React.FormEvent;
                            handleSubmit(syntheticEvent);
                          }, 500);
                        }
                      } catch (err) {
                        setError('Invalid token address in QR code');
                        if (onClaimAttempt) onClaimAttempt(false, 'Invalid token address in QR code');
                      }
                    } else {
                      setError('QR code does not contain a valid token address');
                      if (onClaimAttempt) onClaimAttempt(false, 'QR code does not contain a valid token address');
                    }
                  } else {
                    // Handle standard URLs
                    // Parse the URL
                    const url = new URL(result);

                    // Extract parameters from URL
                    const params = new URLSearchParams(url.search);
                    const eventName = params.get('event');
                    const mintAddress = params.get('mint');

                    if (mintAddress) {
                      try {
                        // Validate the mint address
                        new PublicKey(mintAddress);

                        // Set event details
                        if (eventName) {
                          setEventDetails({
                            name: decodeURIComponent(eventName),
                            mint: mintAddress
                          });
                        } else {
                          setClaimCode(mintAddress);
                        }

                        // Close the scanner
                        setShowQrScanner(false);

                        // If we have everything we need, submit automatically
                        if (connected && publicKey) {
                          setTimeout(() => {
                            // Create a synthetic event object that's compatible with our handler
                            const syntheticEvent = {
                              preventDefault: () => {}
                            } as React.FormEvent;
                            handleSubmit(syntheticEvent);
                          }, 500);
                        }
                      } catch (err) {
                        setError('Invalid token address in QR code');
                        if (onClaimAttempt) onClaimAttempt(false, 'Invalid token address in QR code');
                      }
                    } else {
                      setError('QR code does not contain a valid token address');
                      if (onClaimAttempt) onClaimAttempt(false, 'QR code does not contain a valid token address');
                    }
                  }
                } catch (err) {
                  const errMsg = 'Invalid QR code format. Please scan a Solana Pay QR code.';
                  setError(errMsg);
                  if (onClaimAttempt) onClaimAttempt(false, errMsg);
                }
              }}
              onScanError={(errorMsg) => {
                console.error('QR scan error:', errorMsg);
                setError(errorMsg);
                if (onClaimAttempt) onClaimAttempt(false, errorMsg);
              }}
              onClose={() => {
                console.log('Closing QR scanner');
                setShowQrScanner(false);
              }}
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Event Details Display */}
        {eventDetails ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-muted rounded-lg shadow-sm transition-all hover:shadow-md">
              <p className="font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Event: {eventDetails.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-muted-foreground/70" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                Token: {eventDetails.mint.slice(0, 8)}...{eventDetails.mint.slice(-8)}
              </p>
            </div>

            <div className="text-center py-2 animate-slide-up" style={{animationDelay: '100ms'}}>
              <p className="text-sm text-muted-foreground">
                Connect your wallet and click the button below to claim your token
              </p>
            </div>
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
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('Opening QR scanner...');
                    setShowQrScanner(true);
                    // Force re-render
                    setTimeout(() => {
                      console.log('QR scanner state:', showQrScanner);
                    }, 100);
                  }}
                  className="flex-shrink-0 border-dashed hover:border-primary hover:bg-primary/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
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
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !connected}
          className={`relative transition-all ${
            isSubmitting
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-black hover:bg-slate-100'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Claiming...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
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
