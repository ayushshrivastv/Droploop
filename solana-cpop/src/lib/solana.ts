import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Set the network to devnet for development (use mainnet-beta for production)
export const network = WalletAdapterNetwork.Devnet;

// Create a connection to the Solana cluster
export const endpoint = clusterApiUrl(network);
export const connection = new Connection(endpoint, 'confirmed');

// Utility function to truncate a public key for display
export const truncatePublicKey = (publicKey: string) => {
  if (!publicKey) return '';
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};

// Utility function to validate a public key
export const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

// Utility function to convert a JSON string to a Uint8Array
export const jsonToUint8Array = (json: string): Uint8Array => {
  return new TextEncoder().encode(json);
};

// Utility function to convert a Uint8Array to a JSON string
export const uint8ArrayToJson = (data: Uint8Array): string => {
  return new TextDecoder().decode(data);
};
