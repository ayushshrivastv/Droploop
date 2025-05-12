"use client";

import { useEffect, useState, useRef, type FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { formatPublicKey } from '@/lib/utils/solana';
import { useSafeWallet } from '@/hooks/use-safe-wallet';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

// Dynamically import the WalletMultiButton to ensure it only loads client-side
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

// Modern wallet button style with improved visibility for light theme
const walletButtonStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  color: 'white',
  padding: '10px 18px',
  height: 'auto',
  lineHeight: '1.25rem',
  fontSize: '14px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  border: '1px solid rgba(0, 0, 0, 0.9)',
  borderRadius: '0px', // Square corners for the article style
  transition: 'all 0.2s ease',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
};

const walletButtonHoverStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  border: '1px solid rgba(0, 0, 0, 0.8)',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
};

interface WalletConnectButtonProps {
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showAddress?: boolean;
  className?: string;
}

// Inner component to handle wallet logic and rendering
const WalletConnectButtonContent: FC<WalletConnectButtonProps> = ({
  buttonVariant = 'default',
  buttonSize = 'default',
  showAddress = true,
  className = ''
}) => {
  const [isWalletReady, setIsWalletReady] = useState(false);
  const wallet = useSafeWallet();
  const { publicKey, connected, connecting, disconnect, select, wallet: walletInstance, wallets } = wallet || {};
  
  // Only access modal on client side
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);
  
  // Handle wallet modal safely
  const modalContext = useWalletModal();
  const setVisible = isBrowser ? modalContext?.setVisible : undefined;
  const [isHovered, setIsHovered] = useState(false);
  const walletCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Ensure wallet adapter is fully initialized
  useEffect(() => {
    // Staggered approach to wallet initialization
    walletCheckTimeout.current = setTimeout(() => {
      setIsWalletReady(true);
      console.debug('[WalletButton] Ready for interaction');
    }, 1500); // Adjusted timeout for potentially quicker readiness
    
    return () => {
      if (walletCheckTimeout.current) {
        clearTimeout(walletCheckTimeout.current);
      }
    };
  }, []);

  // Attempt to force reconnect when wallet is available but not connected
  useEffect(() => {
    if (isWalletReady && !connected && !connecting && wallet) {
      const reconnectTimeout = setTimeout(() => {
        try {
          console.debug('[WalletButton] Attempting auto-reconnect');
          if (walletInstance) {
            select(walletInstance.adapter.name);
          }
        } catch (e) {
          console.debug('[WalletButton] Auto-reconnect failed:', e);
        }
      }, 2000); 
      
      return () => clearTimeout(reconnectTimeout);
    }
  }, [isWalletReady, connected, connecting, wallet, select]);

  const handleConnectClick = () => {
    if (!connected && !connecting) {
      setVisible(true); // Open the wallet modal
    }
  };

  if (!isWalletReady) { // Use isWalletReady for the placeholder now
    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={`opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        Loading Wallet...
      </Button>
    );
  }

  if (!wallet || !wallets || wallets.length === 0) {
    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={className}
        onClick={handleConnectClick}
      >
        Install Solana Wallet
      </Button>
    );
  }

  if (!connected) {
    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={className}
        onClick={handleConnectClick}
        disabled={connecting}
        style={walletButtonStyle} // Apply modern style
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  if (publicKey) {
    return (
      <motion.div 
        className={`relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          variant={buttonVariant}
          size={buttonSize}
          style={isHovered ? {...walletButtonStyle, ...walletButtonHoverStyle} : walletButtonStyle}
        >
          {showAddress ? formatPublicKey(publicKey.toBase58()) : 'Wallet Connected'}
        </Button>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 z-10"
          >
            <Button
              onClick={() => disconnect().catch(e => console.error('Disconnect failed', e))}
              className="bg-red-600 hover:bg-red-700 text-white w-full rounded-none"
            >
              Disconnect
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Fallback: Default wallet adapter button if something is unexpected
  // This can be useful for debugging or if the custom UI has issues.
  console.warn('[WalletButton] Fallback: Rendering WalletMultiButton');
  return <WalletMultiButton style={{...walletButtonStyle, borderRadius: '0px'}} className={className} />;
};

export const WalletConnectButton: FC<WalletConnectButtonProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render a simple placeholder during SSR and initial client render
    return (
      <Button
        variant={props.buttonVariant || 'default'}
        size={props.buttonSize || 'default'}
        className={`opacity-50 cursor-not-allowed ${props.className}`}
        disabled
      >
        Loading Wallet...
      </Button>
    );
  }

  // Once mounted, render the actual button content which uses wallet hooks
  return <WalletConnectButtonContent {...props} />;
};
