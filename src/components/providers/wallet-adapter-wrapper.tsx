"use client";

import React, { ReactNode } from 'react';

// Import Solana wallet adapter components directly
import {
  ConnectionProvider as SolanaConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
  useConnection as useSolanaConnection
} from '@solana/wallet-adapter-react';

import {
  WalletModalProvider as SolanaWalletModalProvider
} from '@solana/wallet-adapter-react-ui';

import { Adapter, WalletError } from '@solana/wallet-adapter-base';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Re-export renamed components to avoid naming conflicts
export const ConnectionProvider = SolanaConnectionProvider;
export const WalletProvider = SolanaWalletProvider;
export const WalletModalProvider = SolanaWalletModalProvider;
export const useWallet = useSolanaWallet;
export const useConnection = useSolanaConnection;

// Also provide convenient wrapper components with simplified typing
type ConnectionProviderProps = {
  children: ReactNode;
  endpoint: string;
  config?: Record<string, unknown>;
};

export function ConnectionProviderWrapper(props: ConnectionProviderProps) {
  return <ConnectionProvider {...props} />;
}

type WalletProviderProps = {
  children: ReactNode;
  wallets: Adapter[];
  autoConnect?: boolean;
  onError?: (error: WalletError) => void;
  localStorageKey?: string;
};

export function WalletProviderWrapper(props: WalletProviderProps) {
  return <WalletProvider {...props} />;
}

type WalletModalProviderProps = {
  children: ReactNode;
};

export function WalletModalProviderWrapper(props: WalletModalProviderProps) {
  return <WalletModalProvider {...props} />;
}
