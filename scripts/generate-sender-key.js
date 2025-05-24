import { Keypair } from '@solana/web3.js';

// Generate a new keypair
const senderKeypair = Keypair.generate();

console.log("Generated new sender keypair");
console.log("Public key:", senderKeypair.publicKey.toString());
console.log("\nAdd this to your .env file as NEXT_PUBLIC_SENDER_PRIVATE_KEY:");
console.log(JSON.stringify(Array.from(senderKeypair.secretKey)));
