// Type declarations for @solana/wallet-adapter-react
declare module '@solana/wallet-adapter-react' {
  import { FC, ReactNode } from 'react';
  import { Connection, ConnectionConfig, PublicKey, Transaction } from '@solana/web3.js';
  import { Adapter, WalletError } from '@solana/wallet-adapter-base';

  // ConnectionProvider types
  export interface ConnectionProviderProps {
    children: ReactNode;
    endpoint: string;
    config?: ConnectionConfig;
  }
  export const ConnectionProvider: FC<ConnectionProviderProps>;

  // WalletProvider types
  export interface WalletProviderProps {
    children: ReactNode;
    wallets: Adapter[];
    autoConnect?: boolean;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
  }
  export const WalletProvider: FC<WalletProviderProps>;

  // Wallet context state
  export interface WalletContextState {
    wallet: Adapter | null;
    adapter: Adapter | null;
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;
    disconnecting: boolean;
    select: (walletName: string) => void;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  }
  export function useWallet(): WalletContextState;

  // Connection context state
  export interface ConnectionContextState {
    connection: Connection;
  }
  export function useConnection(): ConnectionContextState;
}
