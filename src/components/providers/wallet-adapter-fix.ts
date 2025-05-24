// This file re-exports the wallet adapter components to fix TypeScript errors
import React, { ReactNode } from 'react';
import { ConnectionProvider as OriginalConnectionProvider, WalletProvider as OriginalWalletProvider } from '@solana/wallet-adapter-react';
import { Adapter, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionConfig } from '@solana/web3.js';

// Define proper types for the wallet adapter components
interface ConnectionProviderProps {
  children: ReactNode;
  endpoint: string;
  config?: ConnectionConfig;
}

interface WalletProviderProps {
  children: ReactNode;
  wallets: Adapter[];
  autoConnect?: boolean;
  onError?: (error: WalletError) => void;
  localStorageKey?: string;
}

// Re-export with proper type assertions
export const ConnectionProvider = OriginalConnectionProvider as React.FC<ConnectionProviderProps>;
export const WalletProvider = OriginalWalletProvider as React.FC<WalletProviderProps>;

// Export other commonly used components
export { useWallet, useConnection } from '@solana/wallet-adapter-react';
export { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
