/**
 * Script to use a test admin wallet for development purposes
 * This script updates the .env file to use a test wallet
 */

const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

// Path to .env file
const ENV_PATH = path.join(__dirname, '.env');

// Main function
async function main() {
  try {
    console.log('🔑 Setting up test admin wallet for development...');

    // Generate a new keypair
    const testAdminKeypair = Keypair.generate();

    // Get public key of test wallet
    const publicKey = testAdminKeypair.publicKey.toBase58();
    console.log(`💳 Test wallet public key: ${publicKey}`);

    // Get private key in base64 format
    const privateKeyBase64 = Buffer.from(testAdminKeypair.secretKey).toString('base64');

    // Read current .env file if it exists
    let currentEnvContent = '';
    try {
      currentEnvContent = fs.readFileSync(ENV_PATH, 'utf8');
      console.log('📝 Read existing .env file');
    } catch (error) {
      console.log('⚠️ No .env file found, creating a new one');
    }

    // Create updated .env content
    const newEnvContent = `# Solana Cluster Configuration
NEXT_PUBLIC_CLUSTER=devnet

# RPC Endpoint - Using default Solana devnet endpoint
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Backup RPC endpoints in case the primary one fails
# NEXT_PUBLIC_BACKUP_RPC_ENDPOINT_1=https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff
# NEXT_PUBLIC_BACKUP_RPC_ENDPOINT_2=https://devnet.genesysgo.net/

# Admin Private Key for Development Testing ONLY
# WARNING: NEVER use this wallet in production or with real funds
# This is a test wallet specifically for development purposes
ADMIN_PRIVATE_KEY=${privateKeyBase64}
`;

    // Write the updated .env file
    fs.writeFileSync(ENV_PATH, newEnvContent, 'utf8');
    console.log('✅ Updated .env file with test admin wallet');

    console.log('\n⚠️ IMPORTANT: This wallet has 0 SOL balance!');
    console.log('   You need to fund it using faucets before testing.');

    console.log('\n👛 Test wallet address for funding:');
    console.log(`   ${publicKey}`);

    console.log('\n📋 To fund this wallet, use these faucets:');
    console.log('1. Solana Faucet: https://faucet.solana.com/');
    console.log('2. SolFaucet: https://solfaucet.com/');
    console.log('3. QuickNode Faucet: https://faucet.quicknode.com/solana/devnet');

    console.log('\n📋 Next steps:');
    console.log('1. Fund the wallet using the faucets mentioned above');
    console.log('2. Run the verification script:');
    console.log('   node test-token-creation.js');
    console.log('3. If the verification is successful, start the application:');
    console.log('   npm run dev');
    console.log('4. Test token creation through the UI');

  } catch (error) {
    console.error('❌ Error setting up test admin wallet:', error.message);
    process.exit(1);
  }
}

main();
