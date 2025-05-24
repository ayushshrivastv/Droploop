"use client";

import React, { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { DEVNET_RPC_ENDPOINT, MAINNET_RPC_ENDPOINT } from '@/lib/constants';
import { toast } from 'sonner';

// Import our wrapper components to avoid TypeScript errors
import {
  ConnectionProviderWrapper as ConnectionProvider,
  WalletProviderWrapper as WalletProvider,
  WalletModalProviderWrapper as WalletModalProvider
} from '@/components/providers/wallet-adapter-wrapper';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface CustomWalletProviderProps {
  children: ReactNode;
  cluster?: 'devnet' | 'mainnet-beta' | 'testnet';
  endpoint?: string;
}

export const CustomWalletProvider: FC<CustomWalletProviderProps> = ({
  children,
  cluster = 'devnet',
  endpoint
}) => {
  // State to track client-side mounting
  const [mounted, setMounted] = useState(false);

  // Set up network
  const network = useMemo(() => {
    switch (cluster) {
      case 'mainnet-beta':
        return WalletAdapterNetwork.Mainnet;
      case 'testnet':
        return WalletAdapterNetwork.Testnet;
      default:
        return WalletAdapterNetwork.Devnet;
    }
  }, [cluster]);

  // Set up endpoint
  const rpcEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    
    const finalEndpoint = cluster === 'mainnet-beta'
      ? MAINNET_RPC_ENDPOINT
      : DEVNET_RPC_ENDPOINT;
      
    console.log(`Using RPC endpoint: ${finalEndpoint} (${cluster})`);
    return finalEndpoint;
  }, [cluster, endpoint]);

  // Set up supported wallets
  const wallets = useMemo(() => {
    try {
      return [
        new PhantomWalletAdapter({ network }),
        new SolflareWalletAdapter({ network }),
      ];
    } catch (error) {
      console.error('Error initializing wallet adapters:', error);
      return [];
    }
  }, [network]);

  // Handle wallet errors
  const onError = (error: Error) => {
    console.error('Wallet error:', error);
    
    if (error.message.includes('Origin not approved')) {
      toast.error('Please approve this app in your wallet extension.');
    } else if (error.message.includes('Wallet not found')) {
      toast.error('Wallet not found. Please install a Solana wallet extension.');
    } else if (error.message.includes('User rejected')) {
      toast.error('Connection rejected. Please try again.');
    } else {
      toast.error(`Wallet error: ${error.message}`);
    }
  };

  // Mark when component is client-side rendered
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Don't render wallet components during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false} // Disable autoConnect to prevent Origin not approved errors
        onError={onError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
