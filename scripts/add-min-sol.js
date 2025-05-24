/**
 * Script to add minimum required SOL to the admin wallet for token creation
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
require('dotenv').config();

// Read admin private key from .env file and derive public key
const adminPrivateKeyBase64 = process.env.ADMIN_PRIVATE_KEY || '';
if (!adminPrivateKeyBase64) {
  console.error('❌ ADMIN_PRIVATE_KEY not found in .env file');
  process.exit(1);
}

// Convert base64 private key to Keypair and get public key
let adminKeypair, adminPublicKey;
try {
  const privateKeyBuffer = Buffer.from(adminPrivateKeyBase64, 'base64');
  adminKeypair = Keypair.fromSecretKey(privateKeyBuffer);
  adminPublicKey = adminKeypair.publicKey;
  console.log(`🔑 Using admin public key: ${adminPublicKey.toBase58().slice(0, 4)}...${adminPublicKey.toBase58().slice(-4)}`);
} catch (error) {
  console.error('❌ Error parsing admin private key:', error);
  process.exit(1);
}

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function addMinimumSol() {
  try {
    // Check current balance
    const initialBalance = await connection.getBalance(adminPublicKey);
    const initialBalanceInSol = initialBalance / LAMPORTS_PER_SOL;
    console.log(`💰 Current admin wallet balance: ${initialBalanceInSol} SOL`);

    // We need at least 2 SOL for token creation
    const MIN_REQUIRED_SOL = 2 * LAMPORTS_PER_SOL;
    
    if (initialBalance >= MIN_REQUIRED_SOL) {
      console.log(`✅ Admin wallet already has sufficient funds (${initialBalanceInSol} SOL)`);
      return;
    }

    // Calculate how much more SOL we need
    const neededSol = MIN_REQUIRED_SOL - initialBalance;
    console.log(`🚀 Need to add ${neededSol / LAMPORTS_PER_SOL} more SOL to reach minimum 2 SOL`);
    
    // Request airdrop with retry mechanism
    let success = false;
    let retryCount = 0;
    const MAX_RETRIES = 10;
    
    while (!success && retryCount < MAX_RETRIES) {
      try {
        console.log(`📡 Requesting airdrop of ${neededSol / LAMPORTS_PER_SOL} SOL (attempt ${retryCount + 1})...`);
        
        // Request airdrop
        const signature = await connection.requestAirdrop(adminPublicKey, neededSol);
        console.log(`Airdrop requested with signature: ${signature}`);
        console.log('Waiting for confirmation...');
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
        success = true;
        
        console.log(`✅ Airdrop successful!`);
      } catch (error) {
        retryCount++;
        console.error(`❌ Airdrop attempt ${retryCount} failed:`, error.message);
        
        if (error.message.includes('429') || error.message.includes('Too many requests')) {
          const waitTime = Math.min(2000 * retryCount, 10000); // Exponential backoff, max 10 seconds
          console.log(`⏳ Rate limited. Waiting ${waitTime/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.log(`⏳ Waiting 2 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Check final balance
    const finalBalance = await connection.getBalance(adminPublicKey);
    const finalBalanceInSol = finalBalance / LAMPORTS_PER_SOL;
    console.log(`💰 Final admin wallet balance: ${finalBalanceInSol} SOL`);
    
    if (finalBalance >= MIN_REQUIRED_SOL) {
      console.log(`✅ Successfully added SOL! Wallet now has enough for token creation.`);
    } else {
      console.log(`⚠️ Still insufficient funds. Please try again later or use a different method to fund the wallet.`);
    }
    
  } catch (error) {
    console.error('❌ Error adding SOL to admin wallet:', error);
    process.exit(1);
  }
}

addMinimumSol();
