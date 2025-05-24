/**
 * Script to check the current SOL balance of the admin wallet
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
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
  console.log(`🔑 Admin public key: ${adminPublicKey.toBase58()}`);
} catch (error) {
  console.error('❌ Error parsing admin private key:', error);
  process.exit(1);
}

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function checkBalance() {
  try {
    // Check current balance
    const balance = await connection.getBalance(adminPublicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log(`💰 Current admin wallet balance: ${balanceInSol} SOL`);
    
    // Check if balance is sufficient for token creation
    if (balanceInSol >= 2) {
      console.log('✅ Balance is sufficient for token creation (2+ SOL)');
    } else {
      console.log('⚠️ Balance is insufficient for token creation (needs 2+ SOL)');
      console.log('💡 Run "node add-more-sol.js" to add more SOL to the wallet');
    }
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    process.exit(1);
  }
}

checkBalance();
