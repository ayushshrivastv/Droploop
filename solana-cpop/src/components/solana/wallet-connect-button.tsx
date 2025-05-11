'use client';

import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { truncatePublicKey } from '@/lib/solana';

interface WalletConnectButtonProps {
  showBalance?: boolean;
}

export const WalletConnectButton: FC<WalletConnectButtonProps> = ({
  showBalance = false,
}) => {
  const { publicKey, connected } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        {showBalance && (
          <div className="text-sm font-medium bg-secondary rounded-lg px-3 py-1">
            0 SOL
          </div>
        )}
        <WalletMultiButton className="wallet-adapter-button-trigger">
          {truncatePublicKey(publicKey.toString())}
        </WalletMultiButton>
      </div>
    );
  }

  return <WalletMultiButton className="wallet-adapter-button-trigger">Connect Wallet</WalletMultiButton>;
};
