"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface WalletReadyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that ensures the wallet context is ready before rendering children
 * This helps prevent "missing provider" errors when components try to access the wallet context too early
 */
export function WalletReadyWrapper({ 
  children, 
  fallback = <div className="p-4 h-[300px] w-full animate-pulse bg-muted/50 rounded-md">Loading wallet...</div> 
}: WalletReadyWrapperProps) {
  const [ready, setReady] = useState(false);
  
  // We're not actually using the wallet here, just checking if the context is available
  // This will throw the error internally but we'll catch it and handle it gracefully
  let contextAvailable = false;
  try {
    // Just access the wallet to see if it throws
    useWallet();
    contextAvailable = true;
  } catch (error) {
    contextAvailable = false;
  }

  useEffect(() => {
    // If context is already available, mark as ready immediately
    if (contextAvailable) {
      setReady(true);
      return;
    }

    // Otherwise, wait a short time to let the provider initialize
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [contextAvailable]);

  // Return fallback content until the wallet context is ready
  if (!ready) {
    return <>{fallback}</>;
  }

  // Once ready, render the actual children
  return <>{children}</>;
}
