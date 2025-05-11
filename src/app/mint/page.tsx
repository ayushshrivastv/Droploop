"use client";

import { useState, useEffect } from 'react';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { ROUTES } from '@/lib/constants';
import { MintForm } from '@/components/mint/mint-form';
import { ReferralStats } from '@/components/mint/referral-stats';
import { SimpleWalletProvider } from '@/components/wallet/simple-wallet-provider';

export default function MintPage() {
  // Setup for client-side rendering
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div className="container mx-auto pt-32 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Create Referral Campaign</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">About Droploop Referrals</h2>
              <p className="text-muted-foreground mb-4">
                Create a referral campaign with compressed tokens using ZK Compression on Solana. Generate unique QR codes for referrers to share and earn rewards for growing your community.
              </p>

              <h3 className="font-medium text-lg mt-6 mb-2">Benefits</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>1000x cost reduction with ZK compression</li>
                <li>Simple sharing via unique QR codes</li>
                <li>On-chain verification of referrals</li>
                <li>Automatic rewards for successful referrals</li>
                <li>Scale to thousands of participants</li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your wallet is connected and you have SOL for transaction fees.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Form */}
          <div className="lg:col-span-2">
            {mounted ? (
              <SimpleWalletProvider
                children={
                  <>
                    <div className="border border-border rounded-lg p-6 mb-8">
                      <MintForm />
                    </div>
                    
                    {/* Referral Statistics */}
                    <div className="border border-border rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">Referral Statistics</h2>
                      <ReferralStats />
                    </div>
                  </>
                }
              />
            ) : (
              <div className="min-h-[600px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Initializing wallet...</div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
  
  return (
    <AppleLayout children={content} />
  );
}
