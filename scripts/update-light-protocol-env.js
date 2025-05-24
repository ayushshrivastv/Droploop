/**
 * update-light-protocol-env.js
 *
 * This script updates the environment configuration to use Light Protocol-enabled RPC endpoints
 * and ensures the application is properly configured for compressed tokens.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load existing environment variables
dotenv.config();

// Path to .env file
const ENV_FILE_PATH = path.join(__dirname, '..', '.env');

// RPC endpoints
// Using standard Solana RPC endpoints
const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';
// Helius RPC endpoints (more reliable)
const HELIUS_DEVNET_RPC = 'https://devnet.helius-rpc.com/?api-key=1d12dc12-c0c6-4d5c-a1f3-3b8ccd228679';
const HELIUS_MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=1d12dc12-c0c6-4d5c-a1f3-3b8ccd228679';

async function main() {
  console.log('🔧 Updating environment for Light Protocol...');

  // Check if .env file exists
  let envFileExists = fs.existsSync(ENV_FILE_PATH);
  let envContents = '';

  if (envFileExists) {
    console.log('📄 Found existing .env file');
    envContents = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  } else {
    console.log('📄 Creating new .env file');
    envContents = `NEXT_PUBLIC_CLUSTER=devnet\n`;
  }

  // Update RPC endpoint to standard Solana RPC endpoint
  if (envContents.includes('NEXT_PUBLIC_RPC_ENDPOINT=')) {
    console.log('🔄 Updating RPC endpoint to standard Solana RPC endpoint');
    envContents = envContents.replace(
      /NEXT_PUBLIC_RPC_ENDPOINT=.*/,
      `NEXT_PUBLIC_RPC_ENDPOINT=${SOLANA_DEVNET_RPC}`
    );
  } else {
    console.log('➕ Adding standard Solana RPC endpoint');
    envContents += `NEXT_PUBLIC_RPC_ENDPOINT=${SOLANA_DEVNET_RPC}\n`;
  }

  // Add Light Protocol specific configurations if they don't exist
  if (!envContents.includes('NEXT_PUBLIC_LIGHT_PROTOCOL_ENABLED=')) {
    console.log('➕ Adding Light Protocol configuration');
    envContents += `NEXT_PUBLIC_LIGHT_PROTOCOL_ENABLED=true\n`;
  }

  // Write updated content back to .env file
  fs.writeFileSync(ENV_FILE_PATH, envContents);
  console.log('✅ Environment updated successfully');
  
  // Display the current configuration (without sensitive data)
  const updatedEnv = envContents
    .split('\n')
    .filter(line => !line.includes('PRIVATE_KEY'))
    .join('\n');
  
  console.log('\n📋 Current configuration:');
  console.log(updatedEnv);
  
  console.log('\n🚀 Light Protocol environment setup complete!');
  console.log('ℹ️  You may need to restart your development server for changes to take effect.');
}

main().catch(err => {
  console.error('Error updating environment:', err);
  process.exit(1);
});
