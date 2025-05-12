// Script to generate a Solana keypair for testing/demo purposes
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');

// Generate a new random keypair
const keypair = Keypair.generate();

// Get the Base58 encoded private key
const privateKeyBase58 = bs58.encode(keypair.secretKey);

// Get public key (wallet address)
const publicKey = keypair.publicKey.toBase58();

console.log(`
Generated Solana Keypair for Testing:
-----------------------------------
Public Key (Wallet Address): ${publicKey}
Private Key (Base58):        ${privateKeyBase58}

IMPORTANT STEPS:
1. Fund this wallet with SOL (for transaction fees)
   Command: solana airdrop 2 ${publicKey} --url https://api.devnet.solana.com

2. Add this private key to your .env.local file:
   NEXT_PUBLIC_ADMIN_PRIVATE_KEY=${privateKeyBase58}

3. For a real deployment, NEVER expose private keys in frontend code.
   This approach is only for hackathon/demo purposes.
`);

// Save the keypair info to a file for reference
const outputContent = `# SOLANA TEST KEYPAIR - DO NOT SHARE OR COMMIT TO GIT
# Created: ${new Date().toISOString()}

PUBLIC_KEY=${publicKey}
PRIVATE_KEY_BASE58=${privateKeyBase58}

# Instructions:
# 1. Fund this wallet: solana airdrop 2 ${publicKey} --url https://api.devnet.solana.com
# 2. Add to .env.local: NEXT_PUBLIC_ADMIN_PRIVATE_KEY=${privateKeyBase58}
`;

fs.writeFileSync('admin-keypair.txt', outputContent);
console.log('Keypair information saved to admin-keypair.txt');
