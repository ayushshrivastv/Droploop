import 'dotenv/config';
import { Keypair } from '@solana/web3.js';

// Direct string method since bs58 is causing issues
function base58ToUint8Array(base58String) {
  // Base58 alphabet definition (excludes characters: 0OIl)
  // cspell:disable-next-line
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = ALPHABET.length;
  
  let decoded = [];
  let multi = 1;
  let i = 0;
  let j = 0;
  
  for (i = base58String.length - 1; i >= 0; i--) {
    const char = base58String[i];
    const charIndex = ALPHABET.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Invalid Base58 character: ${char}`);
    }
    
    let carry = charIndex;
    for (j = 0; j < decoded.length; j++) {
      carry += decoded[j] * base;
      decoded[j] = carry & 0xff;
      carry >>= 8;
    }
    
    while (carry > 0) {
      decoded.push(carry & 0xff);
      carry >>= 8;
    }
  }
  
  // Handle leading zeros in Base58 encoding
  for (i = 0; i < base58String.length && base58String[i] === '1'; i++) {
    decoded.push(0);
  }
  
  return new Uint8Array(decoded.reverse());
}

function analyzeKey() {
  try {
    // Get keys from .env
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    const senderKey = process.env.NEXT_PUBLIC_SENDER_PRIVATE_KEY;
    
    console.log("Analyzing keys in .env file...");
    
    // Check if we have a valid ADMIN_PRIVATE_KEY
    if (adminKey) {
      try {
        const adminSecretKey = new Uint8Array(JSON.parse(adminKey));
        const adminKeypair = Keypair.fromSecretKey(adminSecretKey);
        console.log("ADMIN_PRIVATE_KEY is valid JSON array format.");
        console.log("Admin public key:", adminKeypair.publicKey.toString());
      } catch (e) {
        console.error("ADMIN_PRIVATE_KEY is NOT in valid JSON array format:", e.message);
      }
    } else {
      console.error("ADMIN_PRIVATE_KEY is not defined in .env");
    }
    
    // Check NEXT_PUBLIC_SENDER_PRIVATE_KEY format
    if (senderKey) {
      try {
        // First try to parse as JSON array
        const parsedKey = JSON.parse(senderKey);
        if (Array.isArray(parsedKey)) {
          try {
            const senderKeypair = Keypair.fromSecretKey(new Uint8Array(parsedKey));
            console.log("NEXT_PUBLIC_SENDER_PRIVATE_KEY is already in valid JSON array format.");
            console.log("Sender public key:", senderKeypair.publicKey.toString());
          } catch (e) {
            console.error("NEXT_PUBLIC_SENDER_PRIVATE_KEY contains an invalid JSON array:", e.message);
          }
        } else {
          console.error("NEXT_PUBLIC_SENDER_PRIVATE_KEY contains JSON but is not an array");
        }
      } catch (e) {
        // Not JSON, try as Base58
        console.log("NEXT_PUBLIC_SENDER_PRIVATE_KEY is not in JSON format, checking if it's Base58...");
        
        try {
          // Using our basic implementation
          const secretKey = base58ToUint8Array(senderKey);
          
          if (secretKey.length !== 64) {
            throw new Error(`Invalid key length: ${secretKey.length}, expected 64`);
          }
          
          try {
            const senderKeypair = Keypair.fromSecretKey(secretKey);
            console.log("Successfully parsed Base58 key!");
            console.log("Sender public key:", senderKeypair.publicKey.toString());
            
            // Generate JSON array format for .env
            const jsonArray = JSON.stringify(Array.from(secretKey));
            console.log("\nRECOMMENDED FIX:");
            console.log("Update your .env file to use this JSON array format for NEXT_PUBLIC_SENDER_PRIVATE_KEY:");
            console.log(jsonArray);
          } catch (keypairError) {
            console.error("Failed to create keypair from decoded Base58:", keypairError.message);
          }
        } catch (base58Error) {
          console.error("Failed to decode as Base58:", base58Error.message);
          console.log("\nThis is likely the source of your error. The key needs to be in JSON array format.");
        }
      }
    } else {
      console.error("NEXT_PUBLIC_SENDER_PRIVATE_KEY is not defined in .env");
    }
    
    console.log("\nSUMMARY:");
    console.log("For your app to work correctly, both private keys must be in JSON array format.");
    console.log("Example: [1,2,3,...,64]  (64 numbers representing a Solana private key)");
  } catch (error) {
    console.error("Error analyzing keys:", error);
  }
}

analyzeKey();
