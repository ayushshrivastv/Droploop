import { NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, symbol, quantity, description } = data;
    
    // In a production environment, you would mint tokens with Light Protocol here
    // For now, we'll simulate a successful token creation
    
    // Generate a random token ID to simulate minting
    const mint = Keypair.generate().publicKey.toString();
    const createSignature = Keypair.generate().publicKey.toString();
    const mintSignature = Keypair.generate().publicKey.toString();
    
    return NextResponse.json({
      success: true,
      mint,               // Changed from tokenId to mint to match client expectation
      createSignature,    // Added to match client expectation
      mintSignature,      // Added to match client expectation
      name,
      symbol,
      quantity,
      description,
      message: 'Tokens created successfully'
    });
  } catch (error) {
    console.error('Error creating tokens:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create tokens',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
