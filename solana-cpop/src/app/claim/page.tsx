'use client';

import React from 'react';
import { TokenClaimComponent } from '@/components/qr/token-claim';
import { WalletContextProvider } from '@/components/solana/wallet-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClaimPage() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Claim Your cPOP Token</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Follow these steps to claim your proof of participation token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Solana wallet to proceed with claiming your token.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Scan the QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Scan QR Code" button and position the QR code in the scanner.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Confirm Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Review the details and approve the transaction in your wallet to claim your token.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-medium">View Your Token</h3>
                  <p className="text-sm text-muted-foreground">
                    Once claimed, you can verify your token using the "Verify" page or your Solana wallet.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-sm font-medium text-amber-800">Important Notes:</p>
                <ul className="text-xs text-amber-700 list-disc pl-5 mt-1">
                  <li>Each QR code can only be claimed once</li>
                  <li>QR codes have expiration times</li>
                  <li>You must be connected to Solana devnet</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <WalletContextProvider>
            <TokenClaimComponent />
          </WalletContextProvider>
        </div>
      </div>
    </div>
  );
}
