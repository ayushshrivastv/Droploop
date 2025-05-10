import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { env } from '../env';

// Set the network based on environment variable
export const network =
  env.SOLANA_NETWORK === 'mainnet-beta'
    ? WalletAdapterNetwork.Mainnet
    : env.SOLANA_NETWORK === 'testnet'
      ? WalletAdapterNetwork.Testnet
      : WalletAdapterNetwork.Devnet;

// Create a connection to the Solana cluster
export const endpoint = clusterApiUrl(network);
export const connection = new Connection(endpoint, 'confirmed');

// Get compression parameters from environment
export const MERKLE_TREE_HEIGHT = env.MERKLE_TREE_HEIGHT;
export const MAX_BUFFER_SIZE = env.MAX_BUFFER_SIZE;

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
