const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

// Generate a new keypair
const newKeypair = Keypair.generate();

// Get the private key as a base64 string
const privateKeyBase64 = Buffer.from(newKeypair.secretKey).toString('base64');

// Display the public key and private key
console.log('New Public Key:', newKeypair.publicKey.toString());
console.log('New Private Key (base64):', privateKeyBase64);
