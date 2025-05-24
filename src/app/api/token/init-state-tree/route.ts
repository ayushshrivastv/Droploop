/**
 * @file route.ts
 * @description Server-side API endpoint for initializing the Light Protocol state tree
 * This endpoint handles the one-time setup required for compressed token operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';
import { createConnection, initializeStateTree } from '@/lib/utils/solana';

// Load environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
const CLUSTER = (process.env.NEXT_PUBLIC_CLUSTER as 'devnet' | 'mainnet-beta' | 'testnet' | 'localnet') || 'devnet';

/**
 * POST handler for initializing the state tree
 * This is a one-time operation that needs to be performed before any compressed tokens can be transferred
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Initializing Light Protocol state tree...');

    // Parse the admin keypair for signing
    let adminKeypair: Keypair;

    try {
      if (ADMIN_PRIVATE_KEY) {
        // Try parsing as comma-separated numbers first
        try {
          const privateKeyArray = ADMIN_PRIVATE_KEY.split(',').map(Number);
          // Check if the array has valid numbers (not NaN)
          if (privateKeyArray.some(isNaN)) throw new Error('Invalid private key format');
          adminKeypair = Keypair.fromSecretKey(Buffer.from(privateKeyArray));
        } catch (e) {
          // If that fails, try parsing as a base64 encoded string
          console.log('Trying alternative private key format...');
          adminKeypair = Keypair.fromSecretKey(Buffer.from(ADMIN_PRIVATE_KEY, 'base64'));
        }
      } else {
        // Fallback for demo - generate a new keypair
        console.log('No admin private key found, generating a new keypair for demo purposes');
        adminKeypair = Keypair.generate();
      }

      console.log('Admin public key:', adminKeypair.publicKey.toBase58());
    } catch (error) {
      console.error('Error parsing admin private key:', error);
      return NextResponse.json(
        { error: 'Failed to parse admin private key. Check server logs for details.' },
        { status: 500 }
      );
    }

    // Create a connection to the Solana network
    const connection = createConnection({
      rpcEndpoint: RPC_ENDPOINT,
      cluster: CLUSTER
    });

    // Initialize the state tree
    const { treePublicKey, signature } = await initializeStateTree(
      connection,
      adminKeypair
    );

    // Return the success response with state tree information
    return NextResponse.json({
      success: true,
      treePublicKey: treePublicKey.toBase58(),
      signature,
      message: 'State tree initialized successfully'
    });

  } catch (error) {
    console.error("Error initializing state tree:", error);

    // Extract detailed error information
    let errorMessage = 'State tree initialization failed';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;

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
