/**
 * Alternative script to fund the admin wallet on Solana devnet
 * This script provides instructions on using multiple faucets to get SOL
 */
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read admin public key from environment file or derive from private key
async function getAdminPublicKey() {
  try {
    // Try to parse from .env file
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

    if (!ADMIN_PRIVATE_KEY) {
      throw new Error('Admin private key not found in .env file');
    }

    // Try parsing as base64 first
    try {
      const secretKeyUint8Array = Buffer.from(ADMIN_PRIVATE_KEY, 'base64');
      if (secretKeyUint8Array.length !== 64) {
        throw new Error(`Decoded key length (${secretKeyUint8Array.length}) is not the expected 64 bytes`);
      }
      const keypair = require('@solana/web3.js').Keypair.fromSecretKey(secretKeyUint8Array);
      return keypair.publicKey.toBase58();
    } catch (e) {
      // If that fails, try parsing as comma-separated numbers
      try {
        const privateKeyArray = ADMIN_PRIVATE_KEY.split(',').map(Number);
        if (privateKeyArray.some(isNaN)) {
          throw new Error('Invalid private key format: contains non-numeric values');
        }
        const keypair = require('@solana/web3.js').Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
        return keypair.publicKey.toBase58();
      } catch (innerError) {
        throw new Error(`Failed to parse admin private key: ${innerError.message}`);
      }
    }
  } catch (error) {
    console.error('Error getting admin public key:', error.message);
    return null;
  }
}

// Check the current SOL balance of the admin wallet
async function checkWalletBalance(publicKey) {
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error checking wallet balance:', error.message);
    return 0;
  }
}

// Main function
async function main() {
  console.log('🔑 Admin Wallet Funding Guide 🔑');

  // Get admin public key
  const adminPublicKey = await getAdminPublicKey();

  if (!adminPublicKey) {
    console.error('❌ Could not determine admin public key. Please check your .env file.');
    process.exit(1);
  }

  console.log(`💳 Admin Wallet Public Key: ${adminPublicKey}`);

  // Check current balance
  const currentBalance = await checkWalletBalance(adminPublicKey);
  console.log(`💰 Current balance: ${currentBalance} SOL`);

  if (currentBalance >= 3) {
    console.log('✅ Admin wallet already has sufficient funds (3+ SOL) for token operations!');
    process.exit(0);
  }

  console.log('\n⚠️ Your admin wallet needs at least 3 SOL for reliable token creation.');
  console.log(`📊 Current shortfall: ${Math.max(0, 3 - currentBalance).toFixed(2)} SOL needed`);

  console.log('\n💡 Please fund your admin wallet using these faucets:');
  console.log('\n1. Solana Faucet:');
  console.log('   👉 Visit: https://faucet.solana.com/');
  console.log(`   👉 Enter your admin wallet address: ${adminPublicKey}`);
  console.log('   👉 Request an airdrop (usually 1-2 SOL)');

  console.log('\n2. SolFaucet:');
  console.log('   👉 Visit: https://solfaucet.com/');
  console.log(`   👉 Enter your admin wallet address: ${adminPublicKey}`);
  console.log('   👉 Request an airdrop (usually 0.5-1 SOL)');

  console.log('\n3. QuickNode Faucet:');
  console.log('   👉 Visit: https://faucet.quicknode.com/solana/devnet');
  console.log(`   👉 Enter your admin wallet address: ${adminPublicKey}`);
  console.log('   👉 Request an airdrop (usually 1 SOL)');

  console.log('\n4. GenesysGo Faucet:');
  console.log('   👉 Visit: https://faucet.genesysgo.net/');
  console.log(`   👉 Enter your admin wallet address: ${adminPublicKey}`);

  console.log('\n📋 After funding your wallet:');
  console.log('1. Verify your balance with:');
  console.log('   node test-token-creation.js');
  console.log('2. Once you have 3+ SOL, start the application:');
  console.log('   npm run dev');
  console.log('3. Test token creation through the UI');

  console.log('\n💻 Alternative: Update the admin wallet in your .env file to use a pre-funded wallet:');
  console.log('1. Create a new wallet with funds using the Solana CLI or Phantom browser extension');
  console.log('2. Export its private key');
  console.log('3. Update the ADMIN_PRIVATE_KEY in your .env file');

  // Save the admin public key to a file for easy reference
  const infoPath = path.join(__dirname, 'admin-wallet-info.txt');
  const infoContent = `
Admin Wallet Information
------------------------
Public Key: ${adminPublicKey}
Current Balance: ${currentBalance} SOL
Required Balance: 3+ SOL

Fund this wallet using the faucets mentioned in the console output.
  `;

  fs.writeFileSync(infoPath, infoContent, 'utf8');
  console.log(`\n📄 Wallet information saved to: admin-wallet-info.txt`);
}

main();
