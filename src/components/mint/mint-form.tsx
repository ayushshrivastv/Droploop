/**
 * @file mint-form.tsx
 * @description MintForm component for creating and minting compressed tokens for referral campaigns
 * This component handles the entire referral campaign creation process including collecting campaign details,
 * minting referral tokens with ZK compression, and generating QR codes for referrers to share.
 */

"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEFAULT_TOKEN_DECIMALS } from '@/lib/constants';
import type { MintFormData } from '@/lib/types';
import { createCompressedTokenMint, mintCompressedTokens, createConnection } from '@/lib/utils/solana';
import { Keypair } from '@solana/web3.js';
import { createClaimUrl, createSolanaPayUrl, createSolanaPayClaimUrl, generateQrCodeDataUrl } from '@/lib/utils/qrcode';

/**
 * Type definition for form values inferred from the Zod schema
 */
type FormValues = z.infer<typeof formSchema>;

/**
 * Form validation schema
 * Defines the structure and validation rules for the form data
 */
const formSchema = z.object({
  // Campaign Details
  campaignName: z.string().min(3, { message: "Campaign name must be at least 3 characters" }),
  campaignDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
  campaignEndDate: z.string().min(1, { message: "End date is required" }),
  organizerName: z.string().min(2, { message: "Organizer name is required" }),
  targetReferrals: z.coerce.number().int().positive().optional(),
  
  // Token Metadata
  tokenName: z.string().min(3, { message: "Token name must be at least 3 characters" }),
  tokenSymbol: z.string().min(2, { message: "Token symbol must be at least 2 characters" }),
  tokenDescription: z.string().min(10, { message: "Token description must be at least 10 characters" }),
  tokenImage: z.string().url({ message: "Please enter a valid URL" }).optional(),
  referrerReward: z.coerce.number().int().positive({ message: "Reward must be a positive number" }),
  refereeReward: z.coerce.number().int().positive({ message: "Reward must be a positive number" }),
  tokenSupply: z.coerce.number().int().positive({ message: "Supply must be a positive number" }),
});

/**
 * MintForm Component
 * Handles the token creation process with a multi-step form interface
 * Includes form validation, on-chain token creation, and QR code generation
 */
export function MintForm() {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    
    // Check for tab parameter in URL and switch to campaign tab if specified
    const tabParam = searchParams.get('tab');
    if (tabParam === 'campaign') {
      setActiveTab('campaign');
    }
  }, [searchParams]);

  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("event"); // Default tab is event
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignName: "",
      campaignDescription: "",
      campaignEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      organizerName: "",
      targetReferrals: 100,
      tokenName: "",
      tokenSymbol: "DROP",
      tokenDescription: "",
      tokenImage: "https://picsum.photos/300/300", // Placeholder image
      referrerReward: 2,
      refereeReward: 1,
      tokenSupply: 500,
    },
  });

  if (!isClient) {
    return null; // Or a loading spinner, e.g., <p>Loading form...</p>
  }

  /**
   * Form submission handler
   * Executes the token creation process using the form data
   * 
   * @param values - Form values collected from the user input
   */
  const onSubmit = async (values: FormValues) => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format data for token minting
      const mintData: MintFormData = {
        eventDetails: {
          name: values.campaignName,
          description: values.campaignDescription,
          date: values.campaignEndDate,
          location: "Online", // Default to online for referral campaigns
          organizerName: values.organizerName,
          maxAttendees: values.targetReferrals || 1000, // Use targetReferrals as maxAttendees
        },
        tokenMetadata: {
          name: values.tokenName,
          symbol: values.tokenSymbol,
          description: values.tokenDescription,
          image: values.tokenImage,
          attributes: [
            { trait_type: "Campaign", value: values.campaignName },
            { trait_type: "Date", value: values.campaignEndDate },
            { trait_type: "Organizer", value: values.organizerName },
          ],
        },
        supply: values.tokenSupply,
        decimals: DEFAULT_TOKEN_DECIMALS,
      };

      console.log("Creating token mint with data:", mintData);
      
      // Get config from environment variables or use defaults
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";
      const appConfig = { 
        rpcEndpoint,
        cluster: process.env.NEXT_PUBLIC_CLUSTER as "devnet" | "mainnet-beta" | "testnet" | "localnet" || "devnet"
      };
      
      // We need a keypair for signing transactions
      // In a real app, this would come from the user's wallet
      // For testing, we'll use a generated keypair
      // WARNING: In production, never expose private keys on the client side!
      const payerKeypair = /*window.solana.signTransaction ? await window.solana._keypair :*/ new Keypair(); // Temporary for testing
      
      // 1. Create the compressed token mint
      console.log("Creating compressed token mint...");
      const { mint, signature: createSignature } = await createCompressedTokenMint(
        createConnection(appConfig),
        payerKeypair, // Payer/wallet
        publicKey, // Mint authority
        mintData.decimals,
        mintData.tokenMetadata.name,
        mintData.tokenMetadata.symbol,
        mintData.tokenMetadata.image || "https://arweave.net/placeholder", // Token URI/image
      );
      
      console.log("Token mint created with address:", mint.toBase58());
      console.log("Creation signature:", createSignature);
      
      // 2. Mint tokens to the organizer's wallet
      console.log("Minting tokens to organizer wallet...");
      const { signature: mintSignature } = await mintCompressedTokens(
        createConnection(appConfig),
        payerKeypair, // Payer
        mint, // Mint address
        publicKey, // Destination (organizer's wallet)
        payerKeypair, // Mint authority
        mintData.supply, // Amount to mint
      );
      
      console.log("Tokens minted successfully, signature:", mintSignature);
      
      // 3. Generate both standard claim URL and Solana Pay URL
      const baseUrl = window.location.origin;
      
      // Standard claim URL for direct web access
      const standardClaimUrl = createClaimUrl(
        baseUrl,
        values.campaignName, // Use campaign name as the campaignId
        mint // Pass the PublicKey directly, not as a string
      );
      
      // Solana Pay URL for wallet interaction
      const solanaPayUrl = createSolanaPayClaimUrl(
        publicKey, // The organizer's wallet as recipient
        mint, // The token mint
        values.campaignName, // Campaign name as label
        `Claim your ${values.tokenName} token for ${values.campaignName}` // Memo message
      );
      
      console.log('Generated Standard Claim URL:', standardClaimUrl);
      console.log('Generated Solana Pay URL:', solanaPayUrl);
      
      // Store the standard URL for display and copy purposes
      setClaimUrl(standardClaimUrl);
      
      // Create QR code with the Solana Pay URL for direct wallet interaction
      const qrCodeDataUrl = await generateQrCodeDataUrl(solanaPayUrl);
      setQrCodeUrl(qrCodeDataUrl);
      
      setMintSuccess(true);
    } catch (error) {
      console.error("Error minting token:", error);
      alert(`Error minting token: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleNextTab = () => {
    // Validate only the fields in the current tab before proceeding
    if (activeTab === "campaign") {
      const campaignFields = ["campaignName", "campaignDescription", "campaignEndDate", "organizerName"];
      const hasErrors = campaignFields.some(fieldName => {
        return form.getFieldState(fieldName as any).invalid;
      });
      
      if (!hasErrors) {
        setActiveTab("token");
      }
    }
  };

  if (mintSuccess && qrCodeUrl) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 001.414-1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Token Created Successfully!
          </h3>
          <p className="mt-1">Your referral campaign tokens have been minted and are ready to be claimed.</p>
        </div>

        <Card className="p-6 card-hover animate-slide-up" style={{animationDelay: '100ms'}}>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Claim QR Code
            </h3>
            <p className="text-muted-foreground">Users can scan this QR code with any Solana Pay compatible wallet</p>
            
            <div className="flex justify-center my-6">
              <div className="border border-border p-4 rounded-lg inline-block bg-white shadow-lg transition-all hover:shadow-xl">
                <img src={qrCodeUrl} alt="Solana Pay QR Code" width={250} height={250} className="animate-fade-in" />
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">💡 How It Works</p>
              <p className="text-muted-foreground text-xs">This QR code contains a Solana Pay URL that will trigger a token claim transaction when scanned with a compatible wallet app like Phantom or Solflare.</p>
            </div>
            
            {claimUrl && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Claim URL:</p>
                <div className="bg-muted p-2 rounded text-sm overflow-x-auto">
                  <code>{claimUrl}</code>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" className="transition-all hover:bg-secondary" onClick={() => {
                if (qrCodeUrl) {
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = 'claim-qr-code.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download QR Code
              </Button>
              <Button onClick={() => router.push('/')} className="transition-all hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // When using FormProvider, we need to pass it as a component rather than using it directly
  // This ensures the children prop is properly handled
  return (
    // @ts-ignore - Form component expects children which we're providing
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        <Tabs defaultValue="campaign" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="campaign">Campaign Details</TabsTrigger>
            <TabsTrigger value="token">Token Details</TabsTrigger>
          </TabsList>
          
          {/* Campaign Details Tab */}
          <TabsContent value="campaign" className="space-y-4">
            <FormField
              control={form.control}
              name="campaignName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Droploop Community Growth" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="campaignDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reward users for inviting friends to join Droploop" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="campaignEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="organizerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name or organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="targetReferrals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Referrals (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="100" {...field} />
                  </FormControl>
                  <FormDescription>Your goal for number of successful referrals</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                type="button" 
                onClick={handleNextTab}
                className="bg-white text-black hover:bg-slate-100 transition-all"
              >
                Next: Token Details
              </Button>
            </div>
          </TabsContent>
          
          {/* Token Details Tab */}
          <TabsContent value="token" className="space-y-4">
            <FormField
              control={form.control}
              name="tokenName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Droploop Referral Token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tokenSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="DROP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tokenSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Supply</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Total tokens to mint for this campaign</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="referrerReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referrer Reward</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Tokens earned per successful referral</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="refereeReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New User Reward</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Tokens given to newly referred users</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tokenDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="This token represents participation in the Droploop referral program" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tokenImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormDescription>URL to an image for your token</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setActiveTab("campaign")}>
                Back to Event Details
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="relative transition-all bg-white text-black hover:bg-slate-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Campaign...
                    </span>
                  </>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 001.414-1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Create Campaign
                  </span>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
