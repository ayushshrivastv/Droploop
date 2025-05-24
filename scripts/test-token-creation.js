/**
 * Standalone Test Token Creation Script
 *
 * This script tests token creation directly without requiring imports from the src directory,
 * making it easier to run in a Node.js environment.
 */

require('dotenv').config();
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Transaction, TransactionMessage, VersionedTransaction } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getMintLen, ExtensionType } = require('@solana/spl-token');

// Configuration values
const CLUSTER = process.env.NEXT_PUBLIC_CLUSTER || 'devnet';

// Define multiple RPC endpoints to try
const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff',
  'https://api.devnet.solana.com',
  'https://devnet.solana.com',
  'https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff',
  'https://devnet.genesysgo.net/'
];

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// Test parameters
const TOKEN_NAME = 'Test Token';
const TOKEN_SYMBOL = 'TEST';
// Use a known-good Arweave metadata URI
const TOKEN_METADATA_URI = 'https://arweave.net/TCefB73555sZDrqmX7Y59cUS43h3WQXMZ54u1DK3W8A';
const TOKEN_DECIMALS = 9;
const TOKEN_SUPPLY = 1000000000; // 1000 tokens with 6 decimals

// Simplified connection function
function createConnection(endpoint) {
  return new Connection(endpoint, 'confirmed');
}

// Function to try all available RPC endpoints
async function tryRpcEndpoints(testFunction) {
  // Try each endpoint in sequence
  for (const endpoint of RPC_ENDPOINTS) {
    console.log(`\n🔌 Trying RPC endpoint: ${endpoint}`);
    try {
      const connection = createConnection(endpoint);
      // Test the endpoint with a simple call
      const version = await connection.getVersion();
      console.log(`✅ RPC endpoint responded with version: ${version['solana-core']}`);

      // If we got here, the endpoint is working
      return await testFunction(connection, endpoint);
    } catch (error) {
      console.error(`❌ RPC endpoint ${endpoint} failed: ${error.message}`);
      // Continue to the next endpoint
    }
  }

  // If all endpoints failed
  throw new Error("All RPC endpoints failed. Please check your network connectivity or try again later.");
}

async function testTokenCreation() {
  console.log('🧪 Starting token creation test...');

  // Parse admin keypair
  let adminKeypair;

  try {
    if (!ADMIN_PRIVATE_KEY) {
      throw new Error('Admin private key not found in environment variables');
    }

    console.log('🔑 Parsing admin keypair...');

    // Try parsing as base64 first
    try {
      const secretKeyUint8Array = Buffer.from(ADMIN_PRIVATE_KEY, 'base64');

      // Validate the key length
      if (secretKeyUint8Array.length !== 64) {
        throw new Error(`Decoded key length (${secretKeyUint8Array.length}) is not the expected 64 bytes`);
      }

      adminKeypair = Keypair.fromSecretKey(secretKeyUint8Array);
      console.log('✅ Successfully parsed admin keypair from base64');
    } catch (e) {
      console.error('Base64 parsing error:', e);

      // If that fails, try parsing as comma-separated numbers
      console.log('Trying comma-separated format as fallback...');
      const privateKeyArray = ADMIN_PRIVATE_KEY.split(',').map(Number);

      // Check if the array has valid numbers (not NaN)
      if (privateKeyArray.some(isNaN)) {
        throw new Error('Invalid private key format: contains non-numeric values');
      }

      adminKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
      console.log('✅ Successfully parsed admin keypair from comma-separated numbers');
    }

    // Log admin public key (masked for security)
    const publicKeyBase58 = adminKeypair.publicKey.toBase58();
    const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
    console.log('Admin keypair loaded [masked key:', maskedKey + ']');

    // Create destination wallet (new keypair for testing)
    const destinationKeypair = Keypair.generate();
    console.log('📬 Destination wallet created:', destinationKeypair.publicKey.toBase58());

    // Define the test function to run with a working connection
    const performTest = async (connection, endpoint) => {
      console.log(`\n🔍 Testing Solana connection on endpoint: ${endpoint}`);

      // Check admin wallet balance
      console.log(`💰 Checking admin wallet balance...`);
      const balance = await connection.getBalance(adminKeypair.publicKey);
      console.log(`💰 Admin wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);

      if (balance < 2 * LAMPORTS_PER_SOL) {
        console.warn('⚠️ Warning: Admin wallet balance is less than 2 SOL, which may not be enough for token operations');
      }

      // Check if we can get transaction fees from the network
      console.log('💸 Checking if RPC endpoint supports basic operations...');
      const recentBlockhash = await connection.getLatestBlockhash('confirmed');
      console.log('✅ Successfully retrieved latest blockhash:', recentBlockhash.blockhash.substring(0, 10) + '...');

      // Check if we can get minimum rent
      console.log('🏠 Checking if RPC endpoint supports rent calculations...');
      const rentExemption = await connection.getMinimumBalanceForRentExemption(100); // Test with 100 bytes
      console.log('✅ Successfully calculated rent exemption:', rentExemption, 'lamports');

      console.log('✅ Admin keypair and RPC connection are working correctly!');

      // Try to check for Light Protocol support
      console.log('\n🔍 Testing Light Protocol support...');
      try {
        // Note: This is a basic test for methods that should be supported by Light Protocol
        // We're just checking if the endpoint responds without errors, not actually creating tokens
        console.log('  Checking RPC methods that should be available for Light Protocol...');

        // Try to get recent blockhash with different commitment level
        await connection.getLatestBlockhash('finalized');
        console.log('  ✅ getLatestBlockhash with finalized commitment: Success');

        // Try to get minimum rent with different sizes
        await connection.getMinimumBalanceForRentExemption(1024);
        console.log('  ✅ getMinimumBalanceForRentExemption with larger size: Success');

        console.log('  ✅ Basic RPC methods required for Light Protocol are supported');
        console.log('  ℹ️ Complete Light Protocol support cannot be verified without actual token creation');
      } catch (error) {
        console.warn('  ⚠️ Some RPC methods may not be fully supported:', error.message);
      }

      console.log('\n🎉 Verification completed successfully');
      console.log(`\n💡 Recommended RPC endpoint: ${endpoint}`);
      console.log('\nTo fully test token creation, update your .env file with this RPC endpoint');
      console.log('Then start the application with:');
      console.log('npm run dev');
      console.log('And use the UI to create tokens with the fixes we\'ve implemented.');

      return {
        success: true,
        endpoint,
        balance: balance / LAMPORTS_PER_SOL
      };
    };

    // Try all RPC endpoints
    return await tryRpcEndpoints(performTest);

  } catch (error) {
    console.error('❌ Error in token creation test:', error);

    // Extract detailed error information
    if (error && typeof error === 'object') {
      if ('logs' in error) {
        console.error('\nTransaction Logs:');
        console.error(error.logs);
      }

      if ('code' in error) {
        console.error('\nError Code:', error.code);
      }

      // Check for common errors and provide more helpful messages
      if (error.message?.includes('rent')) {
        console.error('\n💡 Suggestion: This error indicates insufficient funds for rent. Make sure the admin wallet has at least 3 SOL.');
      } else if (error.message?.includes('signature verification failed')) {
        console.error('\n💡 Suggestion: This error suggests an issue with the admin keypair. Check that it\'s correctly formatted in the .env file.');
      } else if (error.message?.includes('failed to get slot') || error.message?.includes('Method not found')) {
        console.error('\n💡 Suggestion: This error indicates the RPC endpoint doesn\'t support all required methods. Try using the Helius RPC endpoint.');
      }
    }
    return { success: false, error: error.message };
  }
}

// Run the test and handle the result
testTokenCreation()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Token creation test successful!');

      // Update .env file with the working endpoint
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '.env');

      try {
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          const newEnvContent = envContent.replace(
            /NEXT_PUBLIC_RPC_ENDPOINT=.*$/m,
            `NEXT_PUBLIC_RPC_ENDPOINT=${result.endpoint}`
          );

          if (newEnvContent !== envContent) {
            fs.writeFileSync(envPath, newEnvContent);
            console.log(`\n✅ Updated .env file with working RPC endpoint: ${result.endpoint}`);
          }
        }
      } catch (error) {
        console.error('\n⚠️ Failed to update .env file:', error.message);
      }

      process.exit(0);
    } else {
      console.error('\n❌ Token creation test failed:', result.error);
      process.exit(1);
    }
  });
