import 'dotenv/config';
import { Keypair } from '@solana/web3.js';
// Now we can use the directly installed package
import bs58 from 'bs58';

function convertKey() {
  try {
    // Get the base58 key from env
    const base58Key = process.env.NEXT_PUBLIC_SENDER_PRIVATE_KEY;
    
    if (!base58Key) {
      console.error('NEXT_PUBLIC_SENDER_PRIVATE_KEY not found in .env');
      return;
    }
    
    // Convert from base58 to Uint8Array
    const decodedKey = bs58.decode(base58Key);
    
    // Create keypair from decoded key
    const keypair = Keypair.fromSecretKey(decodedKey);
    
    // Log public key to verify
    console.log('Public key:', keypair.publicKey.toString());
    
    // Convert to JSON array format
    const jsonArray = JSON.stringify(Array.from(keypair.secretKey));
    
    console.log('\nUse this value for NEXT_PUBLIC_SENDER_PRIVATE_KEY in your .env file:');
    console.log(jsonArray);
  } catch (error) {
    console.error('Error converting key:', error);
  }
}

convertKey();
