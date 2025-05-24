/**
 * @file mint-form.tsx
 * @description MintForm component for creating referral NFTs for the Droploop referral program
 * This component handles the entire referral NFT creation process including collecting program details,
 * minting referral NFTs, and generating QR codes for claiming rewards.
 */

"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_TOKEN_DECIMALS } from '@/lib/constants';
import type { MintFormData, ReferralProgramData } from '@/lib/types';
import { createCompressedTokenMint, mintCompressedTokens, createConnection } from '@/lib/utils/solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { createClaimUrl, createSolanaPayUrl, createSolanaPayClaimUrl, generateQrCodeDataUrl } from '@/lib/utils/qrcode';
import { toast } from '@/components/ui/use-toast';
// Using standard SVG icons instead of lucide-react

/**
 * Type definition for form values inferred from the Zod schema
 */
type FormValues = z.infer<typeof formSchema>;

/**
 * Form validation schema
 * Defines the structure and validation rules for the referral program form data
 */
const formSchema = z.object({
  // Program Details
  programName: z.string().min(3, { message: "Program name must be at least 3 characters" }),
  programDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
  programEndDate: z.string().min(1, { message: "End date is required" }),
  creatorName: z.string().min(2, { message: "Creator name is required" }),
  programWebsite: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  programSocial: z.string().optional().or(z.literal('')),
  
  // Referral Rewards
  rewardAmount: z.coerce.number().positive({ message: "Reward amount must be a positive number" }),
  rewardCurrency: z.string().min(1, { message: "Reward currency is required" }),
  maxReferrals: z.coerce.number().int().positive({ message: "Maximum referrals must be a positive number" }),
  tieredRewards: z.boolean().default(false),
  secondTierAmount: z.coerce.number().nonnegative().optional(),
  rewardDistribution: z.enum(["instant", "manual", "milestone"]).default("instant"),
  
  // Referral NFT Metadata
  referralNftName: z.string().min(3, { message: "NFT name must be at least 3 characters" }),
  referralNftSymbol: z.string().min(2, { message: "NFT symbol must be at least 2 characters" }),
  referralNftDescription: z.string().min(10, { message: "NFT description must be at least 10 characters" }),
  referralNftImage: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  referralNftSupply: z.coerce.number().int().positive({ message: "Supply must be a positive number" }),
  transferable: z.boolean().default(true),
});

/**
 * MintForm Component
 * Handles the referral NFT creation process with a multi-step form interface
 * Includes form validation, on-chain NFT creation, and QR code generation for referrals
 */
export function MintForm() {
  // Always call hooks unconditionally in the same order
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("program");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extract wallet properties safely - only use them when client-side
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;
  const signTransaction = isClient ? wallet.signTransaction : null;
  const sendTransaction = isClient ? wallet.sendTransaction : null;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Program Details
      programName: "",
      programDescription: "",
      programEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      creatorName: "",
      programWebsite: "",
      programSocial: "",
      
      // Reward Details
      rewardAmount: 5,
      rewardCurrency: "USDC",
      maxReferrals: 50,
      tieredRewards: false,
      secondTierAmount: 2.5,
      rewardDistribution: "instant",
      
      // NFT Details
      referralNftName: "",
      referralNftSymbol: "REF",
      referralNftDescription: "",
      referralNftImage: "https://picsum.photos/300/300", // Placeholder image
      referralNftSupply: 100,
      transferable: true,
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
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Variables to store token creation results
    let mint: PublicKey;
    let createSignature: string;
    let mintSignature: string;

    try {
      const referralData: ReferralProgramData = {
        programDetails: {
          name: values.programName,
          description: values.programDescription,
          endDate: values.programEndDate,
          creatorName: values.creatorName,
        },
        rewardDetails: {
          amount: values.rewardAmount,
          currency: values.rewardCurrency,
          maxReferrals: values.maxReferrals,
        },
        nftMetadata: {
          name: values.referralNftName,
          symbol: values.referralNftSymbol,
          description: values.referralNftDescription,
          image: values.referralNftImage || '', // Ensure image is always a string
          attributes: [{
            trait_type: "Program",
            value: values.programName
          }, {
            trait_type: "Reward",
            value: `${values.rewardAmount} ${values.rewardCurrency}`
          }]
        },
        supply: values.referralNftSupply,
        decimals: DEFAULT_TOKEN_DECIMALS,
      };

      console.log("Creating referral NFT with data:", referralData);

      // Call our server-side API endpoint
      const response = await fetch('/api/referral/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralData,
          creatorWallet: publicKey.toBase58(), // The creator's wallet address
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Server-side token creation failed:", result);
        let errorMessage = "An unknown error occurred.";
        let errorDetails = "";
        
        if (result && result.error) {
          errorMessage = result.error;
        } else if (result && result.message) {
          errorMessage = result.message;
        }
        
        // Check for detailed error information
        if (result && result.details) {
          if (typeof result.details === 'string') {
            errorDetails = result.details;
          } else {
            try {
              errorDetails = JSON.stringify(result.details, null, 2);
            } catch (e) {
              errorDetails = 'Could not stringify error details';
            }
          }
          console.error("Error details:", errorDetails);
        }

        // Check if we have a mint address even though there was an error
        // This can happen if token creation succeeded but minting failed
        if (result && result.mint) {
          console.log("Mint address was created despite error:", result.mint);
          mint = new PublicKey(result.mint);
          
          // Generate URLs even if minting failed
          const baseUrl = window.location.origin;
          const standardClaimUrl = createClaimUrl(
            baseUrl,
            values.programName,
            mint
          );
          const solanaPayUrl = createSolanaPayClaimUrl(
            publicKey,
            mint,
            values.programName,
            `Join the ${values.programName} referral program and earn ${values.rewardAmount} ${values.rewardCurrency}`
          );

          console.log('Generated Standard Claim URL despite error:', standardClaimUrl);
          console.log('Generated Solana Pay URL despite error:', solanaPayUrl);
          setClaimUrl(standardClaimUrl);

          try {
            const qrCodeDataUrl = await generateQrCodeDataUrl(solanaPayUrl);
            console.log('QR code generated successfully despite error');
            setQrCodeUrl(qrCodeDataUrl);
            // Don't set mintSuccess to true here since there was still an error
          } catch (qrError) {
            console.error('Error generating QR code:', qrError);
          }
        }

        if (errorMessage.includes("insufficient lamports") || errorMessage.includes("balance is insufficient")) {
          toast({
            title: "Referral NFT Creation Failed",
            description: "The admin wallet has insufficient SOL to perform this transaction. Please add more SOL and try again.",
            variant: "destructive",
            duration: 7000,
          });
        } else if (errorMessage.includes("RPC method not found") || errorMessage.includes("timeout") || errorMessage.includes("network")) {
          toast({
            title: "Network Error",
            description: "There seems to be an issue with the Solana RPC endpoint. Please try again later or check your network settings.",
            variant: "destructive",
            duration: 7000,
          });
        } else {
          toast({
            title: "Error Creating Referral NFT",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        // If we have a mint address, we can continue with partial success
        if (mint) {
          console.log("Continuing with partial success since we have a mint address");
          // Set partial success to true
          setMintSuccess(true);
          return; // Don't throw an error, just return
        }
        
        // No return here, finally will set isSubmitting to false
        throw new Error(errorMessage); // throw to be caught by outer catch
      }

      console.log("Server-side referral NFT creation successful:", result);

      mint = new PublicKey(result.mint);
      // For referral NFTs, we might not have separate signatures
      createSignature = result.createSignature || 'N/A';
      mintSignature = result.mintSignature || 'N/A';

      console.log("Referral NFT mint created with address:", mint.toBase58());
      console.log("Creation signature:", createSignature);
      console.log("Mint signature:", mintSignature);
      console.log("Referral NFTs minted successfully");

      const baseUrl = window.location.origin;
      const standardClaimUrl = createClaimUrl(
        baseUrl,
        values.programName,
        mint
      );
      const solanaPayUrl = createSolanaPayClaimUrl(
        publicKey,
        mint,
        values.programName,
        `Join the ${values.programName} referral program and earn ${values.rewardAmount} ${values.rewardCurrency}`
      );

      console.log('Generated Standard Claim URL:', standardClaimUrl);
      console.log('Generated Solana Pay URL:', solanaPayUrl);
      setClaimUrl(standardClaimUrl);

      console.log('Generating QR code for URL:', solanaPayUrl);
      try {
        const qrCodeDataUrl = await generateQrCodeDataUrl(solanaPayUrl);
        console.log('QR code generated successfully');
        setQrCodeUrl(qrCodeDataUrl);
        setMintSuccess(true);
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        // Fallback to a simple QR code if the advanced one fails
        try {
          const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(solanaPayUrl)}`;
          console.log('Using fallback QR code URL:', fallbackQrUrl);
          setQrCodeUrl(fallbackQrUrl);
          setMintSuccess(true);
        } catch (fallbackError) {
          console.error('Even fallback QR code failed:', fallbackError);
          toast({
            title: "QR Code Generation Failed",
            description: "Could not generate QR code, but your referral program was created successfully.",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      // Handle errors from fetch, QR code generation, or explicitly thrown errors
      // Toasts are expected to be shown where the error originates or is specifically handled (like response.ok check)
      // This catch block is more of a fallback.
      console.error("Error in onSubmit process:", error);
      if (!(error instanceof Error && (error.message.includes("insufficient lamports") || error.message.includes("RPC method not found")))) {
        // Avoid double-toasting if already handled by specific checks
         toast({
            title: "Operation Failed",
            description: error instanceof Error ? error.message : "An unexpected error occurred during the process.",
            variant: "destructive",
          });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle next button in program details tab
  const handleNextTab = () => {
    const programFields = ["programName", "programDescription", "programEndDate", "creatorName", "rewardAmount", "rewardCurrency", "maxReferrals"] as const;
    const isValid = programFields.every(field => {
      const result = form.trigger(field);
      return result;
    });

    if (isValid) {
      setActiveTab("nft");
    }
  };

  if (mintSuccess && qrCodeUrl) {
    return (
      <div className="animate-fade-in">
        <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 dark:border-green-800">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Referral Program Created!</h3>
            <p className="text-green-700 dark:text-green-400 max-w-md mx-auto">Your referral NFTs have been minted successfully and are ready to be shared.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* QR Code Column */}
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-lg shadow-md border border-green-100 dark:border-green-800 mb-3 max-w-[240px]">
                <img src={qrCodeUrl} alt="Referral QR Code" className="w-full h-auto" />
              </div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Scan with a Solana wallet</p>
            </div>
            
            {/* Info Column */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="flex items-center text-base font-semibold text-green-800 dark:text-green-300 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </h4>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Share this QR code with potential referrals</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>They scan with a Solana wallet like Phantom</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Rewards are distributed automatically</span>
                  </li>
                </ul>
              </div>
              
              {claimUrl && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="flex items-center text-base font-semibold text-green-800 dark:text-green-300 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Claim URL
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-sm overflow-x-auto border border-slate-200 dark:border-slate-700">
                    <code className="text-green-700 dark:text-green-400 break-all">{claimUrl}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              className="bg-white dark:bg-slate-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900" 
              onClick={() => {
                if (qrCodeUrl) {
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = 'referral-qr-code.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </Button>
            
            <Button 
              onClick={() => router.push('/')} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="program">Program Details</TabsTrigger>
            <TabsTrigger value="nft">Referral NFT</TabsTrigger>
          </TabsList>
          {/* Program Details Tab */}
          <TabsContent value="program" className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-medium mb-2">Program Information</h3>
              <p className="text-sm text-muted-foreground mb-0">Define the basic details of your referral program</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Program Name */}
              <FormField
                control={form.control}
                name="programName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Program Name
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Summer Referral Program" 
                        className="bg-white dark:bg-slate-950" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Choose a catchy name for your referral program</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Program Description */}
              <FormField
                control={form.control}
                name="programDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Program Description
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Invite friends to join Droploop and earn rewards for each successful referral..."
                        className="min-h-[120px] bg-white dark:bg-slate-950"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Explain how your referral program works and what rewards users can earn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program End Date */}
                <FormField
                  control={form.control}
                  name="programEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          End Date
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>When your referral program will end</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Creator Name */}
                <FormField
                  control={form.control}
                  name="creatorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Creator Name
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your Name or Organization" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Who is running this referral program</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program Website */}
                <FormField
                  control={form.control}
                  name="programWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Website (Optional)
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://yourbrand.com" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Your product or company website</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Program Social */}
                <FormField
                  control={form.control}
                  name="programSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          Social Media (Optional)
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="@username" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Your Twitter/X handle or other social media</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mt-8 mb-4">
              <h3 className="text-lg font-medium mb-2">Reward Configuration</h3>
              <p className="text-sm text-muted-foreground mb-0">Define the rewards for successful referrals</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reward Amount */}
                <FormField
                  control={form.control}
                  name="rewardAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reward Amount
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Amount per successful referral</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Reward Currency */}
                <FormField
                  control={form.control}
                  name="rewardCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Reward Currency
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="SOL">SOL</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="BONK">BONK</SelectItem>
                            <SelectItem value="CUSTOM">Custom Token</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Currency for reward payments</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max Referrals */}
                <FormField
                  control={form.control}
                  name="maxReferrals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Max Referrals
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Maximum referrals per user</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Reward Distribution */}
                <FormField
                  control={form.control}
                  name="rewardDistribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                          Distribution Method
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Select distribution method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant Rewards</SelectItem>
                            <SelectItem value="manual">Manual Approval</SelectItem>
                            <SelectItem value="milestone">Milestone Based</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>How rewards will be distributed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Next: Referral NFT Configuration
              </Button>
            </div>
          </TabsContent>
          {/* Referral NFT Tab */}
          <TabsContent value="nft" className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-medium mb-2">Referral NFT Configuration</h3>
              <p className="text-sm text-muted-foreground mb-0">Design the NFT that will be shared with referrals</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* NFT Name */}
              <FormField
                control={form.control}
                name="referralNftName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        NFT Name
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Summer Referral Pass" 
                        className="bg-white dark:bg-slate-950" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>A memorable name for your referral NFT</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NFT Symbol */}
                <FormField
                  control={form.control}
                  name="referralNftSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          NFT Symbol
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="REF" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Short symbol (2-5 characters)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* NFT Supply */}
                <FormField
                  control={form.control}
                  name="referralNftSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          NFT Supply
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          className="bg-white dark:bg-slate-950" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Total number of referral NFTs to create</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* NFT Description */}
              <FormField
                control={form.control}
                name="referralNftDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        NFT Description
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="This NFT represents participation in our referral program. Share with friends to earn rewards..."
                        className="min-h-[120px] bg-white dark:bg-slate-950"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Describe what this referral NFT represents and how it works</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* NFT Image URL */}
              <FormField
                control={form.control}
                name="referralNftImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        NFT Image URL (Optional)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        className="bg-white dark:bg-slate-950" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>URL to an image for your referral NFT (recommended: 300x300px)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Transferable Option */}
              <FormField
                control={form.control}
                name="transferable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white dark:bg-slate-950">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          Transferable NFT
                        </div>
                      </FormLabel>
                      <FormDescription>
                        Allow users to transfer their referral NFTs to others
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <div
                          role="checkbox"
                          aria-checked={field.value}
                          data-state={field.value ? "checked" : "unchecked"}
                          className={`peer h-4 w-7 shrink-0 rounded-full border border-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${field.value ? 'bg-primary' : 'bg-input'}`}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <span
                            data-state={field.value ? "checked" : "unchecked"}
                            className={`block h-3 w-3 rounded-full bg-background transition-transform ${field.value ? 'translate-x-3' : 'translate-x-0'}`}
                          />
                        </div>
                        <span>{field.value ? "Yes" : "No"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab("program")}
                className="bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Program Details
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || !connected}
                className="transition-all bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Referral Program...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Create Referral Program
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
