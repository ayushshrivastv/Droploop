/**
 * Simple script to generate a Solana wallet
 */
const { Keypair } = require('@solana/web3.js');

// Generate a new keypair
const keypair = Keypair.generate();

console.log('\n=== New Solana Wallet ===');
console.log(`\nPublic Key (address): ${keypair.publicKey.toString()}`);
console.log(`\nPrivate Key (for ADMIN_PRIVATE_KEY - JSON array format):`);
console.log(JSON.stringify(Array.from(keypair.secretKey)));

console.log('\nTo fund this wallet with devnet SOL, visit:');
console.log(`https://solfaucet.com and input: ${keypair.publicKey.toString()}`);
