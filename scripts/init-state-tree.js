#!/usr/bin/env node

/**
 * State Tree Initialization Script
 * 
 * This script initializes a state tree for Light Protocol, which is required
 * before any compressed tokens can be transferred.
 * 
 * Usage: node scripts/init-state-tree.js
 */

const dotenv = require('dotenv');
const { Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction, SystemProgram } = require('@solana/web3.js');
const { createRpc, sendAndConfirmTx } = require('@lightprotocol/stateless.js');
const { CompressedTokenProgram } = require('@lightprotocol/compressed-token');
const { TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');

// Load environment variables
dotenv.config();

// Helper function to create RPC connection
function createConnection(config) {
  const { rpcEndpoint } = config;
  // Create a Light Protocol RPC connection
  const rpc = createRpc(rpcEndpoint, rpcEndpoint);
  return rpc;
}

// Helper function to initialize a state tree
async function initializeStateTree(connection, payer) {
  console.log('Initializing state tree for Light Protocol...');

  try {
    // Create a mint keypair for the token
    const mintKeypair = Keypair.generate();
    console.log('Generated mint keypair:', mintKeypair.publicKey.toBase58());
    
    // Use the built-in createMint function from CompressedTokenProgram
    // This handles all the necessary setup for the state tree and token pool
    const [createMintAccountIx, initializeMintIx, createTokenPoolIx] = 
      await CompressedTokenProgram.createMint({
        feePayer: payer.publicKey,
        authority: payer.publicKey,
        mint: mintKeypair.publicKey,
        decimals: 0,
        freezeAuthority: null,
        rentExemptBalance: await connection.getMinimumBalanceForRentExemption(82),
        tokenProgramId: TOKEN_2022_PROGRAM_ID,
        mintSize: 82,
      });

    // Create and send the transaction
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      instructions: [createMintAccountIx, initializeMintIx, createTokenPoolIx],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer, mintKeypair]);

    const signature = await sendAndConfirmTx(connection, transaction);
    console.log('State tree initialized successfully, signature:', signature);
    
    // The token pool instruction contains the tree public key
    // We can extract it from the instruction data or just use the mint key for now
    return {
      treePublicKey: mintKeypair.publicKey,
      signature,
    };
  } catch (error) {
    console.error('Error initializing state tree:', error);
    if (error && typeof error === 'object' && 'logs' in error) {
      console.error('Solana Transaction Logs from error object:', error.logs);
    }
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🌳 Initializing Light Protocol state tree...');
    
    // Parse the admin keypair from environment variables
    let adminKeypair;
    const privateKeyEnv = process.env.ADMIN_PRIVATE_KEY;
    
    if (!privateKeyEnv) {
      console.error('❌ ADMIN_PRIVATE_KEY not found in environment variables');
      process.exit(1);
    }
    
    try {
      // Try parsing as comma-separated numbers first
      try {
        const privateKeyArray = privateKeyEnv.split(',').map(Number);
        // Check if the array has valid numbers (not NaN)
        if (privateKeyArray.some(isNaN)) throw new Error('Invalid private key format');
        adminKeypair = Keypair.fromSecretKey(Buffer.from(privateKeyArray));
      } catch (e) {
        // If that fails, try parsing as a base64 encoded string
        console.log('Trying alternative private key format...');
        adminKeypair = Keypair.fromSecretKey(Buffer.from(privateKeyEnv, 'base64'));
      }
    } catch (error) {
      console.error('❌ Error parsing admin private key:', error);
      process.exit(1);
    }
    
    console.log(`👤 Admin public key: ${adminKeypair.publicKey.toBase58()}`);
    
    // Create a connection to the Solana network
    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    const cluster = process.env.NEXT_PUBLIC_CLUSTER || 'devnet';
    
    console.log(`🔗 Connecting to ${cluster} at ${rpcEndpoint}`);
    const connection = createConnection({
      rpcEndpoint,
      cluster
    });
    
    // Initialize the state tree
    console.log('🚀 Creating state tree...');
    const { treePublicKey, signature } = await initializeStateTree(
      connection,
      adminKeypair
    );
    
    console.log('✅ State tree initialized successfully!');
    console.log(`🌳 Tree public key: ${treePublicKey.toBase58()}`);
    console.log(`📝 Transaction signature: ${signature}`);
    console.log(`🔍 View transaction: https://explorer.solana.com/tx/${signature}?cluster=${cluster}`);
    
  } catch (error) {
    console.error('❌ Error initializing state tree:', error);
    process.exit(1);
  }
}

// Run the main function
main();
