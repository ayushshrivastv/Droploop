"use client";

import { AppleLayout } from '@/components/layouts/apple-layout';
import { ROUTES } from '@/lib/constants';
import { ClaimForm } from '@/components/claim/claim-form';
import { Suspense } from 'react';

export default function ClaimPage() {
  return (
    <AppleLayout>
      {/* Content */}
      <div className="container mx-auto pt-32 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Join Through Referral</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">About Droploop Referrals</h2>
              <p className="text-muted-foreground mb-4">
                Join Droploop through a friend's referral by entering their referral code or scanning their QR code. Both you and your referrer will receive Droploop tokens as a reward.
              </p>

              <h3 className="font-medium text-lg mt-6 mb-2">How to Join</h3>
              <ol className="list-decimal pl-5 text-muted-foreground space-y-2">
                <li>Connect your Solana wallet</li>
                <li>Enter the referral code or scan the QR code</li>
                <li>Approve the transaction in your wallet</li>
                <li>Both you and your referrer receive Droploop tokens</li>
              </ol>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">No Referral?</h3>
                <p className="text-sm text-muted-foreground">
                  If you don't have a referral code, you can still join but won't receive bonus tokens. Make sure your wallet is connected and you have SOL for transaction fees.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Claim Form */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-lg p-6">
              <Suspense fallback={<div className="py-8 text-center">Loading referral form...</div>}>
                <ClaimForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
