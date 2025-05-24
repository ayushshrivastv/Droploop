import 'dotenv/config';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';

async function checkWalletBalance() {
  try {
    if (!process.env.ADMIN_PRIVATE_KEY) {
      console.error('ADMIN_PRIVATE_KEY is not defined in .env file');
      return;
    }

    // Parse admin private key
    const secretKey = new Uint8Array(JSON.parse(process.env.ADMIN_PRIVATE_KEY));
    const adminKeypair = Keypair.fromSecretKey(secretKey);
    const publicKey = adminKeypair.publicKey;
    
    console.log('Admin wallet address:', publicKey.toString());
    
    // Get RPC endpoint from env or use default
    const endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    console.log('Using RPC endpoint:', endpoint);
    
    // Check cluster
    const cluster = process.env.NEXT_PUBLIC_CLUSTER || 'devnet';
    console.log('Using cluster:', cluster);
    
    // Create connection and check balance
    const connection = new Connection(endpoint);
    const balance = await connection.getBalance(publicKey);
    
    console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    console.log(`Minimum required: 0.9 SOL`);
    console.log(`Sufficient balance: ${balance / LAMPORTS_PER_SOL >= 0.9 ? 'Yes' : 'No'}`);
    
    // Check other important environment variables
    console.log('\nEnvironment Variables Check:');
    console.log(`ADMIN_PRIVATE_KEY: ${process.env.ADMIN_PRIVATE_KEY ? 'Set' : 'Not set'}`);
    console.log(`NEXT_PUBLIC_RPC_ENDPOINT: ${process.env.NEXT_PUBLIC_RPC_ENDPOINT ? process.env.NEXT_PUBLIC_RPC_ENDPOINT : 'Not set (using default)'}`);
    console.log(`NEXT_PUBLIC_CLUSTER: ${process.env.NEXT_PUBLIC_CLUSTER ? process.env.NEXT_PUBLIC_CLUSTER : 'Not set (using default)'}`);
    console.log(`NEXT_PUBLIC_SENDER_PRIVATE_KEY: ${process.env.NEXT_PUBLIC_SENDER_PRIVATE_KEY ? 'Set' : 'Not set'}`);
    
  } catch (error) {
    console.error('Error checking wallet details:', error);
  }
}

checkWalletBalance();
