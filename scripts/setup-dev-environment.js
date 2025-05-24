/**
 * setup-dev-environment.js
 *
 * This script sets up the development environment for the application by:
 * 1. Generating a new admin keypair if one doesn't exist
 * 2. Writing the admin private key to the .env file
 * 3. Optionally requesting an airdrop of SOL to the admin wallet (on devnet)
 */

import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load existing environment variables
dotenv.config();

// Constants
const ENV_FILE_PATH = path.join(__dirname, '.env');
const DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';

async function main() {
  console.log('🔧 Setting up development environment...');

  // Check if .env file exists
  let envFileExists = fs.existsSync(ENV_FILE_PATH);
  let envContents = '';

  if (envFileExists) {
    console.log('📄 Found existing .env file');
    envContents = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  } else {
    console.log('📄 Creating new .env file');
    envContents = `NEXT_PUBLIC_CLUSTER=devnet\nNEXT_PUBLIC_RPC_ENDPOINT=${DEVNET_RPC_ENDPOINT}\n`;
  }

  // Check if admin private key exists in .env
  const adminKeyExists = envContents.includes('ADMIN_PRIVATE_KEY=') &&
                         !envContents.includes('ADMIN_PRIVATE_KEY=DUMMY_VALUE_WILL_BE_REPLACED_AT_RUNTIME');

  let adminKeypair;
  let publicKeyBase58;

  if (adminKeyExists) {
    console.log('🔑 Found existing admin keypair');
    // Extract existing private key
    const match = envContents.match(/ADMIN_PRIVATE_KEY=(.*)/);
    if (match && match[1]) {
      try {
        // Try parsing as base64
        const privateKeyBuffer = Buffer.from(match[1], 'base64');
        adminKeypair = Keypair.fromSecretKey(privateKeyBuffer);
        publicKeyBase58 = adminKeypair.publicKey.toBase58();
        // Only show a masked version of the public key for security
        const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
        console.log(`✅ Using existing admin keypair [masked key: ${maskedKey}]`);
      } catch (error) {
        console.log('❌ Error parsing existing admin private key, generating new one');
        adminKeypair = generateNewAdminKeypair();
        publicKeyBase58 = adminKeypair.publicKey.toBase58();
      }
    }
  } else {
    console.log('🔑 Generating new admin keypair');
    adminKeypair = generateNewAdminKeypair();
    publicKeyBase58 = adminKeypair.publicKey.toBase58();

    // Update or add ADMIN_PRIVATE_KEY to .env
    const privateKeyBase64 = Buffer.from(adminKeypair.secretKey).toString('base64');
    if (envContents.includes('ADMIN_PRIVATE_KEY=')) {
      envContents = envContents.replace(/ADMIN_PRIVATE_KEY=.*/, `ADMIN_PRIVATE_KEY=${privateKeyBase64}`);
    } else {
      envContents += `ADMIN_PRIVATE_KEY=${privateKeyBase64}\n`;
    }

    // Write updated content back to .env file
    fs.writeFileSync(ENV_FILE_PATH, envContents);
    console.log(`✅ Admin keypair generated and saved to .env file`);
    // Only show a masked version of the public key for security
    const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
    console.log(`📝 Admin keypair created [masked key: ${maskedKey}]`);
  }

  // Request SOL airdrop for the admin wallet on devnet
  console.log('💰 Requesting SOL airdrop for admin wallet on devnet...');
  try {
    const connection = new Connection(DEVNET_RPC_ENDPOINT, 'confirmed');
    const publicKey = new PublicKey(publicKeyBase58);

    // Check current balance
    const balance = await connection.getBalance(publicKey);
    console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    // We need at least 0.9 SOL for token creation (reduced from 2 SOL)
    const MIN_REQUIRED_SOL = 0.9 * LAMPORTS_PER_SOL;
    
    if (balance < MIN_REQUIRED_SOL) {
      console.log(`Balance below 0.9 SOL (required for token creation), requesting airdrops...`);
      
      // Request multiple airdrops if needed to reach 2 SOL
      let currentBalance = balance;
      while (currentBalance < MIN_REQUIRED_SOL) {
        try {
          // Request 1 SOL at a time (devnet limit)
          const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
          console.log(`Airdrop requested with signature: ${signature}`);
          console.log('Waiting for airdrop confirmation...');

          // Wait for confirmation with retry mechanism
          let retries = 5;
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

          // Check updated balance
          currentBalance = await connection.getBalance(publicKey);
          console.log(`Updated balance: ${currentBalance / LAMPORTS_PER_SOL} SOL`);
          
          // Add a delay between requests to avoid rate limiting
          if (currentBalance < MIN_REQUIRED_SOL) {
            console.log('Waiting before requesting another airdrop...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`Error during airdrop: ${error.message}`);
          if (error.message.includes('429')) {
            console.log('Server responded with 429 Too Many Requests. Retrying after 500ms delay...');
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            throw error;
          }
        }
      }
      
      console.log(`✅ Airdrops successful! Final balance: ${currentBalance / LAMPORTS_PER_SOL} SOL`);
    } else {
      console.log('✅ Wallet already has sufficient funds (0.9+ SOL)');
    }
  } catch (error) {
    console.error('❌ Error requesting airdrop:', error.message);
    console.log('⚠️ You may need to manually fund the admin wallet with SOL');
  }

  console.log('🚀 Development environment setup complete!');
}

function generateNewAdminKeypair() {
  // Generate a completely random keypair
  return Keypair.generate();
}

main().catch(err => {
  console.error('Error setting up development environment:', err);
  process.exit(1);
});
