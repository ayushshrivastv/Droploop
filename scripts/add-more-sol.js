/**
 * Script to add more SOL to the admin wallet
 * This will request multiple airdrops to ensure sufficient funds for token creation
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

// Read admin private key from .env file and derive public key
const adminPrivateKeyBase64 = process.env.ADMIN_PRIVATE_KEY || '';
if (!adminPrivateKeyBase64) {
  console.error('❌ ADMIN_PRIVATE_KEY not found in .env file');
  process.exit(1);
}

// Convert base64 private key to Keypair and get public key
const { Keypair } = require('@solana/web3.js');
let adminPublicKey;
try {
  const privateKeyBuffer = Buffer.from(adminPrivateKeyBase64, 'base64');
  const adminKeypair = Keypair.fromSecretKey(privateKeyBuffer);
  adminPublicKey = adminKeypair.publicKey;
  console.log(`🔑 Using admin public key: ${adminPublicKey.toBase58().slice(0, 4)}...${adminPublicKey.toBase58().slice(-4)}`);
} catch (error) {
  console.error('❌ Error parsing admin private key:', error);
  process.exit(1);
}

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function addMoreSol() {
  try {
    // Check current balance
    const initialBalance = await connection.getBalance(adminPublicKey);
    const initialBalanceInSol = initialBalance / LAMPORTS_PER_SOL;
    console.log(`💰 Current admin wallet balance: ${initialBalanceInSol} SOL`);

    // Target balance: 200 SOL for extensive testing
    const targetBalance = 200 * LAMPORTS_PER_SOL;
    
    if (initialBalance >= targetBalance) {
      console.log(`✅ Admin wallet already has sufficient funds (${initialBalanceInSol} SOL)`);
      return;
    }

    // Request multiple airdrops to reach target balance
    const neededSol = targetBalance - initialBalance;
    console.log(`🚀 Requesting additional ${neededSol / LAMPORTS_PER_SOL} SOL...`);


    // For testing purposes, we'll simulate adding 200 SOL by using a different approach
    // Since devnet has limitations on airdrop amounts (typically 2 SOL per request)
    
    // We'll use a loop to request multiple airdrops with retry logic
    console.log(`🚀 Adding 200 SOL to admin wallet (this may take some time)...`);
    
    // Track progress
    let totalAdded = 0;
    let successfulAirdrops = 0;
    let failedAirdrops = 0;
    
    // Request 2 SOL at a time (devnet limit) until we reach target or max attempts
    const maxAirdropAmount = 2 * LAMPORTS_PER_SOL;
    const maxAttempts = 150; // Set a reasonable limit to avoid infinite loops
    
    for (let i = 0; i < maxAttempts; i++) {
      // Check current balance to see if we've reached target
      const currentBalance = await connection.getBalance(adminPublicKey);
      if (currentBalance >= targetBalance) {
        console.log(`🎉 Target balance reached! Current balance: ${currentBalance / LAMPORTS_PER_SOL} SOL`);
        break;
      }
      
      // Calculate remaining amount needed
      const remaining = targetBalance - currentBalance;
      const airdropAmount = Math.min(maxAirdropAmount, remaining);
      
      console.log(`📡 Airdrop attempt #${i+1}: Requesting ${airdropAmount / LAMPORTS_PER_SOL} SOL...`);
      
      try {
        // Request airdrop with retry mechanism
        let signature;
        let retries = 3;
        
        while (retries > 0) {
          try {
            signature = await connection.requestAirdrop(adminPublicKey, airdropAmount);
            break;
          } catch (err) {
            console.log(`Airdrop request failed, retrying... (${retries} attempts left)`);
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log(`Airdrop requested with signature: ${signature}`);
        console.log('Waiting for confirmation...');
        
        // Wait for confirmation with retry mechanism
        retries = 5;
        while (retries > 0) {
          try {
            await connection.confirmTransaction(signature, 'confirmed');
            break;
          } catch (err) {
            console.log(`Confirmation failed, retrying... (${retries} attempts left)`);
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Update counters
        totalAdded += airdropAmount;
        successfulAirdrops++;
        console.log(`✅ Airdrop #${i+1} successful: Added ${airdropAmount / LAMPORTS_PER_SOL} SOL`);
        console.log(`💰 Progress: ${totalAdded / LAMPORTS_PER_SOL} SOL added so far (${successfulAirdrops} successful airdrops)`);
        
      } catch (error) {
        failedAirdrops++;
        console.error(`❌ Airdrop #${i+1} failed:`, error.message);
        
        // Handle rate limiting errors specially
        if (error.message.includes('429') || error.message.includes('Too many requests')) {
          console.log('⏳ Rate limited by Solana devnet. Waiting 5 seconds before retrying...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          // For other errors, wait a bit less
          console.log('⏳ Waiting 2 seconds before next attempt...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Always add a small delay between attempts to avoid rate limiting
      console.log('⏳ Waiting before next airdrop attempt...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (airdropAmount <= 0) break;

      console.log(`📡 Requesting airdrop #${i+1} of ${numAirdrops}: ${airdropAmount / LAMPORTS_PER_SOL} SOL...`);
      
      // Request airdrop and wait for confirmation
      const signature = await connection.requestAirdrop(adminPublicKey, airdropAmount);
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`✅ Airdrop #${i+1} successful: ${signature}`);
      
      // Add a small delay between airdrops to avoid rate limiting
      if (i < numAirdrops - 1) {
        console.log('⏳ Waiting 2 seconds before next airdrop...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    }

    // Check final balance
    const finalBalance = await connection.getBalance(adminPublicKey);
    const finalBalanceInSol = finalBalance / LAMPORTS_PER_SOL;
    console.log(`💰 Final admin wallet balance: ${finalBalanceInSol} SOL`);
    console.log(`✅ Added ${(finalBalance - initialBalance) / LAMPORTS_PER_SOL} SOL to admin wallet`);

  } catch (error) {
    console.error('❌ Error adding SOL to admin wallet:', error);
    process.exit(1);
  }
}

addMoreSol();
