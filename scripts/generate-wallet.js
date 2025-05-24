/**
 * Script to generate a new Solana wallet keypair for testing
 * Run with: node scripts/generate-wallet.js
 */

const { Keypair } = require('@solana/web3.js');

// First install bs58
const { execSync } = require('child_process');
console.log('Installing required packages...');
execSync('npm install bs58 --no-save', { stdio: 'inherit' });

// Now import bs58
const bs58 = require('bs58');

// Generate a new random keypair
const keypair = Keypair.generate();

// Output in both formats needed for environment variables
console.log('\n=== New Solana Wallet ===');
console.log(`\nPublic Key (address): ${keypair.publicKey.toString()}`);
console.log(`\nPrivate Key (for ADMIN_PRIVATE_KEY - JSON array format):`);
console.log(JSON.stringify(Array.from(keypair.secretKey)));

// Convert the secret key to base58 format
const secretKeyBase58 = bs58.encode(Buffer.from(keypair.secretKey));
console.log(`\nPrivate Key (base58 for NEXT_PUBLIC_SENDER_PRIVATE_KEY):`);
console.log(secretKeyBase58);

console.log('\nIMPORTANT: Store these keys securely. Never commit them to version control.');
console.log('\nFor development, you can copy these values to your .env file.');
console.log('Remember to fund this wallet with devnet SOL: https://solfaucet.com\n');
