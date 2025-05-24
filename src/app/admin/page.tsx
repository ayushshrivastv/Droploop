'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { StateTreeSetup } from '@/components/admin/state-tree-setup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

/**
 * Admin page for managing the application
 * Provides access to administrative functions like initializing state trees
 */
export default function AdminPage() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        This page provides administrative functions for managing the application.
      </p>

      {/* Wallet Connection Check */}
      {!connected && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to access admin functions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* State Tree Setup */}
        <div className="col-span-1">
          <StateTreeSetup />
        </div>

        {/* Admin Functions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Admin Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={ROUTES.CREATE_TOKEN} passHref>
                <Button variant="outline" className="w-full">
                  Create New Token
                </Button>
              </Link>
              <Link href={ROUTES.HOME} passHref>
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
