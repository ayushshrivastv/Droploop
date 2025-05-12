"use client";

import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

/**
 * A hook that safely accesses the wallet context, preventing SSR errors.
 * Only attempts to access wallet methods on the client.
 */
export function useSafeWallet(): WalletContextState | null {
  const [isMounted, setIsMounted] = useState(false);
  const wallet = useWallet();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only return the wallet context when running on the client
  if (!isMounted) {
    return null;
  }
  
  return wallet;
}
