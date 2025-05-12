import { Keypair } from '@solana/web3.js';
import { decode } from 'bs58';

/**
 * IMPORTANT SECURITY NOTICE:
 * 
 * This file contains code for managing Solana keypairs. For production applications:
 * 1. NEVER store private keys in frontend code or environment variables accessible to clients
 * 2. Use a backend service with proper key management systems
 * 3. Consider using session-based authentication or other secure methods
 * 
 * This implementation is ONLY for hackathon/demo purposes and should be replaced
 * with a secure implementation before any production deployment.
 */

/**
 * Gets the admin keypair for token distribution
 * For hackathon/demo purposes only
 * 
 * @returns Admin keypair or null if not configured
 */
export function getAdminKeypair(): Keypair | null {
  // In a real app, this would be handled by a secure backend
  // The frontend would make API calls instead of directly managing keys
  
  try {
    // For demo purposes, you can set this in .env.local (DO NOT COMMIT THIS FILE)
    const privateKeyBase58 = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
    
    if (!privateKeyBase58) {
      console.warn('Admin private key not configured. Token transfers will fail.');
      return null;
    }
    
    // Convert the base58 private key to Uint8Array and create a keypair
    const privateKeyBytes = decode(privateKeyBase58);
    return Keypair.fromSecretKey(new Uint8Array(privateKeyBytes));
  } catch (error) {
    console.error('Error creating admin keypair:', error);
    return null;
  }
}

/**
 * Check if the admin keypair is properly configured
 * 
 * @returns Boolean indicating if keypair is available
 */
export function isAdminKeypairConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
}
