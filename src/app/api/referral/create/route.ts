/**
 * @file route.ts
 * @description Server-side API endpoint for creating referral NFTs
 * This endpoint handles the referral NFT creation process securely on the server
 * without exposing private keys to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createConnection, createCompressedTokenMint, mintCompressedTokens } from '@/lib/utils/solana';
import { DEFAULT_TOKEN_DECIMALS } from '@/lib/constants';
import type { ReferralProgramData } from '@/lib/types';

// Load environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
const CLUSTER = (process.env.NEXT_PUBLIC_CLUSTER as 'devnet' | 'mainnet-beta' | 'testnet' | 'localnet') || 'devnet';

// Minimum required SOL balance for token operations
const MIN_REQUIRED_SOL = 0.9; // 0.9 SOL

/**
 * POST handler for referral NFT creation
 * Receives referral program data from the client and processes it securely on the server
 */
export async function POST(request: NextRequest) {
  // Define adminKeypair at the function scope level so it's available in catch block
  let adminKeypair: Keypair;
  
  try {
    console.log('Referral NFT creation API called');
    // Parse the request body
    const data = await request.json() as {
      referralData: ReferralProgramData;
      creatorWallet: string;
    };
    
    const { referralData, creatorWallet } = data;
    console.log('Received referral data:', JSON.stringify(referralData, null, 2));
    console.log('Creator wallet:', creatorWallet);
    
    // Validate required data
    if (!referralData || !creatorWallet) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll use a server-side keypair
    // In production, this would be securely stored in environment variables
    // or a key management system
    let adminKeypair: Keypair;
    
    if (ADMIN_PRIVATE_KEY) {
      // Use the provided admin private key
      const secretKey = new Uint8Array(JSON.parse(ADMIN_PRIVATE_KEY));
      adminKeypair = Keypair.fromSecretKey(secretKey);
    } else {
      // Generate a new keypair for testing purposes only
      // This should NOT be used in production
      console.warn('WARNING: Using a generated keypair. This should only be used for testing.');
      adminKeypair = Keypair.generate();
    }

    // Create a connection to the Solana cluster
    const connection = createConnection({
      cluster: CLUSTER,
      rpcEndpoint: RPC_ENDPOINT
    });
    
    // Check admin wallet balance
    const adminBalance = await connection.getBalance(adminKeypair.publicKey);
    console.log(`Admin wallet balance: ${adminBalance / LAMPORTS_PER_SOL} SOL`);
    
    if (adminBalance < MIN_REQUIRED_SOL * LAMPORTS_PER_SOL) {
      return NextResponse.json(
        { 
          error: 'Insufficient SOL balance for token operations',
          details: `Admin wallet needs at least ${MIN_REQUIRED_SOL} SOL, but has ${adminBalance / LAMPORTS_PER_SOL} SOL`
        },
        { status: 400 }
      );
    }

    // Create the referral NFT mint
    console.log('Creating compressed token mint...');
    console.log('Admin public key:', adminKeypair.publicKey.toBase58());
    console.log('Mint authority:', adminKeypair.publicKey.toBase58());
    console.log('Decimals:', DEFAULT_TOKEN_DECIMALS);
    console.log('Token name:', referralData.nftMetadata.name);
    console.log('Token symbol:', referralData.nftMetadata.symbol);
    
    // Generate metadata URI from the NFT metadata
    // In a production environment, this would be uploaded to decentralized storage
    // For now, we'll create a mock URI with the metadata embedded
    const metadataObj = {
      name: referralData.nftMetadata.name,
      symbol: referralData.nftMetadata.symbol,
      description: referralData.nftMetadata.description,
      image: referralData.nftMetadata.image || '',
      attributes: [
        {
          trait_type: 'Program Name',
          value: referralData.programDetails.name
        },
        {
          trait_type: 'Creator',
          value: referralData.programDetails.creatorName
        },
        {
          trait_type: 'End Date',
          value: referralData.programDetails.endDate
        },
        {
          trait_type: 'Reward Amount',
          value: referralData.rewardDetails.amount
        },
        {
          trait_type: 'Reward Currency',
          value: referralData.rewardDetails.currency
        },
        {
          trait_type: 'Max Referrals',
          value: referralData.rewardDetails.maxReferrals
        }
      ]
    };
    
    // Create a mock URI with base64 encoded metadata
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadataObj)).toString('base64')}`;
    
    // Create the compressed token mint
    console.log('Attempting to create compressed token mint with the following parameters:');
    console.log('- Admin keypair public key:', adminKeypair.publicKey.toBase58());
    console.log('- Mint authority:', adminKeypair.publicKey.toBase58());
    console.log('- Decimals:', referralData.decimals || 0);
    console.log('- Token name:', referralData.nftMetadata.name);
    console.log('- Token symbol:', referralData.nftMetadata.symbol);
    
    let mintResult;
    try {
      mintResult = await createCompressedTokenMint(
        connection,
        adminKeypair,
        adminKeypair.publicKey, // Use admin as mint authority
        referralData.decimals || 0,
        referralData.nftMetadata.name,
        referralData.nftMetadata.symbol,
        metadataUri
      );
      console.log('Compressed token mint creation successful');
    } catch (mintError) {
      console.error('Error creating compressed token mint:', mintError);
      // Format the error for better debugging
      const errorDetails = mintError instanceof Error ? 
        { message: mintError.message, stack: mintError.stack } : 
        JSON.stringify(mintError);
      
      return NextResponse.json(
        { 
          error: 'Failed to create compressed token mint', 
          details: errorDetails,
        },
        { status: 500 }
      );
    }
    
    const { mint, signature } = mintResult;
    
    console.log('Mint created:', mint.toBase58());
    console.log('Metadata URI:', metadataUri);

    // Mint the referral NFTs to the creator
    console.log('Minting tokens to creator wallet...');
    const destinationPublicKey = new PublicKey(creatorWallet);
    const mintAmount = referralData.supply;
    const decimals = referralData.decimals || DEFAULT_TOKEN_DECIMALS;
    
    console.log('Minting with parameters:');
    console.log('- Destination wallet:', destinationPublicKey.toBase58());
    console.log('- Mint address:', mint.toBase58());
    console.log('- Amount:', mintAmount);
    console.log('- Decimals:', decimals);
    
    try {
      const mintResult = await mintCompressedTokens(
        connection,
        adminKeypair,
        mint,
        destinationPublicKey,
        adminKeypair, // Use admin as mint authority
        mintAmount
      );
      console.log('Token minting successful, signature:', mintResult.signature);
    } catch (mintError) {
      console.error('Error minting tokens:', mintError);
      // Format the error for better debugging
      const errorDetails = mintError instanceof Error ? 
        { message: mintError.message, stack: mintError.stack } : 
        JSON.stringify(mintError);
      
      return NextResponse.json(
        { 
          error: 'Failed to mint tokens to creator wallet', 
          details: errorDetails,
          mint: mint.toBase58(), // Return the mint address even if minting failed
          metadataUri: metadataUri
        },
        { status: 500 }
      );
    }

    // Return success response with mint address and metadata URI
    return NextResponse.json({
      success: true,
      mint: mint.toBase58(),
      metadataUri: metadataUri,
      signature,
      supply: mintAmount,
      decimals,
      programDetails: referralData.programDetails,
      rewardDetails: referralData.rewardDetails
    });
    
  } catch (error) {
    console.error('Error creating referral NFT:', error);
    
    // Enhanced error logging for debugging
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      // If it's not an Error object, log the entire error
      console.error('Non-standard error object:', JSON.stringify(error, null, 2));
    }
    
    // Create a type guard for errors with logs
    type SolanaErrorWithLogs = Error & { logs?: string[] };
    type SolanaErrorWithCode = Error & { code?: string | number };
    type LightProtocolError = Error & { type?: string, data?: unknown };
    
    if (error && typeof error === 'object') {
      // Log every property of the error object
      console.error('Error properties:');
      type ErrorProperty = string | number | boolean | object | null | undefined;
      for (const key in error) {
        try {
          // Using a more specific type assertion
          console.error(`- ${key}:`, (error as Record<string, ErrorProperty>)[key]);
        } catch (e) {
          console.error(`- ${key}: [Cannot stringify]`);
        }
      }
      
      const solanaError = error as SolanaErrorWithLogs & SolanaErrorWithCode & LightProtocolError;
      
      if ('logs' in solanaError && solanaError.logs) {
        console.error('Solana Transaction Logs:', solanaError.logs);
        errorDetails += '\nTransaction logs: ' + JSON.stringify(solanaError.logs);
      }
      
      // Extract any other useful error information
      if ('code' in solanaError && solanaError.code) {
        console.error('Error code:', solanaError.code);
        errorDetails += '\nError code: ' + solanaError.code;
      }
      
      // Check for Light Protocol specific properties
      if ('type' in solanaError && solanaError.type) {
        console.error('Light Protocol error type:', solanaError.type);
        errorDetails += '\nLight Protocol error type: ' + solanaError.type;
      }
      
      if ('data' in solanaError && solanaError.data) {
        console.error('Light Protocol error data:', solanaError.data);
        try {
          errorDetails += '\nLight Protocol error data: ' + JSON.stringify(solanaError.data);
        } catch (e) {
          errorDetails += '\nLight Protocol error data: [Cannot stringify]';
        }
      }
    }
    
    // Try to determine if this is a Light Protocol specific error
    if (errorDetails.includes('compression') || errorDetails.includes('light-protocol')) {
      console.error('This appears to be a Light Protocol specific error');
    }
    
    // Try to determine if this is a network issue
    if (errorDetails.includes('timeout') || errorDetails.includes('network') || 
        errorDetails.includes('connection') || errorDetails.includes('RPC')) {
      console.error('This appears to be a network or RPC endpoint issue');
    }
    
    // Get the admin wallet address from the earlier variable
    const adminWalletAddress = adminKeypair?.publicKey?.toString() || 'unknown';
    console.log('Admin wallet used for operation:', adminWalletAddress);
    
    // Create a serializable error object
    const errorObject = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : JSON.stringify(error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create referral NFT', 
        details: errorDetails,
        errorObject: errorObject,
        adminWallet: adminWalletAddress
      },
      { status: 500 }
    );
  }
}
