/**
 * @file route.ts
 * @description Server-side API endpoint for claiming compressed tokens
 * This endpoint handles the token claiming process securely on the server
 * without exposing private keys to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  Keypair, 
  PublicKey, 
  Connection, 
  Cluster, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo, 
  transfer
} from '@solana/spl-token';
import { createConnection, transferCompressedTokens } from '@/lib/utils/solana';

// Load environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
const CLUSTER = (process.env.NEXT_PUBLIC_CLUSTER as Cluster) || 'devnet';

/**
 * POST handler for token claiming
 * Receives token data from the client and processes it securely on the server
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json() as {
      mint: string;
      destination: string;
    };

    const { mint, destination } = data;

    // Validate required data
    if (!mint || !destination) {
      return NextResponse.json(
        { error: 'Missing required data. Both mint and destination addresses are required.' },
        { status: 400 }
      );
    }

    console.log(`Attempting to claim token with mint ${mint} for destination ${destination}`);

    // Validate admin private key
    if (!ADMIN_PRIVATE_KEY) {
      console.error('Admin private key is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // Create admin keypair from private key
    let adminKeypair: Keypair;
    try {
      const adminPrivateKeyUint8Array = Uint8Array.from(Buffer.from(ADMIN_PRIVATE_KEY, 'base64'));
      adminKeypair = Keypair.fromSecretKey(adminPrivateKeyUint8Array);
    } catch (error) {
      console.error('Error parsing admin private key:', error);
      return NextResponse.json(
        { error: 'Invalid admin private key format. Please check server configuration.' },
        { status: 500 }
      );
    }

    // Convert string addresses to PublicKey objects
    let mintPublicKey: PublicKey;
    let destinationPublicKey: PublicKey;

    try {
      mintPublicKey = new PublicKey(mint);
      destinationPublicKey = new PublicKey(destination);
    } catch (error) {
      console.error('Invalid public key format:', error);
      return NextResponse.json(
        { error: 'Invalid public key format. Please provide valid Solana addresses.' },
        { status: 400 }
      );
    }

    console.log("Admin public key:", adminKeypair.publicKey.toBase58());
    console.log("Mint public key:", mintPublicKey.toBase58());
    console.log("Destination public key:", destinationPublicKey.toBase58());
    
    // Token amount to transfer (typically 1 for NFTs or compressed tokens)
    const amountToTransfer = 1;
    
    try {
      // First try compressed token transfer
      try {
        // Create Light Protocol connection
        const config = {
          rpcEndpoint: RPC_ENDPOINT,
          cluster: CLUSTER as 'devnet' | 'mainnet-beta' | 'testnet' | 'localnet',
        };
        const lightConnection = createConnection(config);
        
        console.log("Attempting compressed token transfer...");
        const { signature } = await transferCompressedTokens(
          lightConnection,
          adminKeypair,
          mintPublicKey,
          amountToTransfer,
          adminKeypair,
          destinationPublicKey
        );
        
        console.log("Compressed token transfer successful, signature:", signature);
        
        return NextResponse.json({
          success: true,
          mint: mintPublicKey.toBase58(),
          destination: destinationPublicKey.toBase58(),
          signature,
          amount: amountToTransfer,
          method: 'compressed',
        });
      } catch (compressedError: unknown) {
        // Compressed token transfer failed, let's create and transfer a standard token
        const compErr = compressedError as Error;
        console.error("Compressed token error:", compErr.message);
        console.log("Creating and transferring a standard token as fallback...");
        
        // Create a standard connection
        const connection = new Connection(RPC_ENDPOINT, 'confirmed');
        
        // 1. Create a new token mint with the admin as mint authority
        console.log("Creating new token mint...");
        const newMint = await createMint(
          connection,
          adminKeypair,         // Payer
          adminKeypair.publicKey, // Mint authority
          null,                // Freeze authority (null = no freeze authority)
          0                    // Decimals, using 0 for NFT-like tokens
        );
        
        console.log("New token mint created:", newMint.toBase58());
        
        // 2. Create token account for sender (admin)
        console.log("Creating token account for admin...");
        const adminTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          adminKeypair,
          newMint,
          adminKeypair.publicKey
        );
        
        console.log("Admin token account:", adminTokenAccount.address.toBase58());
        
        // 3. Mint token to admin account
        console.log("Minting token to admin account...");
        const mintTx = await mintTo(
          connection,
          adminKeypair,
          newMint,
          adminTokenAccount.address,
          adminKeypair.publicKey,
          amountToTransfer
        );
        
        console.log("Token minted to admin, signature:", mintTx);
        
        // 4. Create token account for recipient if it doesn't exist
        console.log("Creating token account for recipient...");
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          adminKeypair,
          newMint,
          destinationPublicKey
        );
        
        console.log("Recipient token account:", recipientTokenAccount.address.toBase58());
        
        // 5. Transfer token from admin to recipient
        console.log("Transferring token to recipient...");
        const transferTx = await transfer(
          connection,
          adminKeypair,
          adminTokenAccount.address,
          recipientTokenAccount.address,
          adminKeypair.publicKey,
          amountToTransfer
        );
        
        console.log("Standard token transfer successful, signature:", transferTx);
        
        return NextResponse.json({
          success: true,
          mint: newMint.toBase58(),
          destination: destinationPublicKey.toBase58(),
          signature: transferTx,
          amount: amountToTransfer,
          method: 'standard_new',
          mintCreated: true
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Final error in token claim API:", err.message);
      throw err;
    }

  } catch (error) {
    console.error("Error in token claim API:", error);

    // Extract detailed error information
    let errorMessage = 'Token claim failed';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific Solana transaction errors
      if (error.message.includes('Transaction signature verification failure')) {
        errorDetails = 'This may be due to an invalid admin keypair or insufficient funds. Please check your environment variables and wallet balance.';
      } else if (error.message.includes('Simulation failed')) {
        errorDetails = 'The transaction simulation failed. This could be due to program constraints or invalid parameters.';
      } else if (error.message.includes('blockhash')) {
        errorDetails = 'Recent blockhash error. The transaction may have expired. Please try again.';
      } else if (error.message.includes('0x1')) {
        errorDetails = 'Insufficient funds to pay for transaction fees. Please add SOL to the admin wallet.';
      }

      // Include stack trace in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error.stack);
      }
    } else {
      errorDetails = String(error);
    }

    // Return a detailed error response
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails || String(error),
        success: false
      },
      { status: 500 }
    );
  }
}
