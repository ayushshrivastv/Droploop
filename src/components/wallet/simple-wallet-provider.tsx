"use client";

import React, { ReactNode, useMemo, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import Solana wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SimpleWalletProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
  endpoint?: string;
}

/**
 * A simplified wallet provider for Solana wallet integration with Droploop
 */
export function SimpleWalletProvider(props: SimpleWalletProviderProps) {
  const { 
    children, 
    network = WalletAdapterNetwork.Devnet, 
    endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet) 
  } = props;
  
  // Client-side rendering check to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Set up wallet adapters for Solana
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network })
  ], [network]);
  
  // Loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading wallet...
        </div>
      </div>
    );
  }

  // Suppress TypeScript errors using any type assertion
  // This is necessary because the Solana wallet adapter types are not fully compatible with strict mode
  const AnyConnectionProvider = ConnectionProvider as any;
  const AnyWalletProvider = WalletProvider as any;
  const AnyWalletModalProvider = WalletModalProvider as any;
  
  return (
    <AnyConnectionProvider endpoint={endpoint}>
      <AnyWalletProvider wallets={wallets} autoConnect>
        <AnyWalletModalProvider>
          {children}
        </AnyWalletModalProvider>
      </AnyWalletProvider>
    </AnyConnectionProvider>
  );
}
