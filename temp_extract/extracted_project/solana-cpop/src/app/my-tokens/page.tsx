'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock token data
const mockTokens = [
  {
    id: 'token_12345',
    name: 'Hackathon Participant Token',
    symbol: 'HPT',
    description: 'This token certifies participation in the Solana Hackathon 2025.',
    event: 'Solana Hackathon 2025',
    claimedAt: '2025-05-16T14:30:00Z',
    imageUrl: 'https://placehold.co/400x400/3A3E6C/FFFFFF/png?text=HPT',
  },
  {
    id: 'token_67890',
    name: 'Solana Conference Attendee',
    symbol: 'SCA',
    description: 'Proof of attendance for the annual Solana Conference.',
    event: 'Solana Conference 2025',
    claimedAt: '2025-04-22T10:15:00Z',
    imageUrl: 'https://placehold.co/400x400/3A3E6C/FFFFFF/png?text=SCA',
  },
  {
    id: 'token_24680',
    name: 'Solana Workshop Completion',
    symbol: 'SWC',
    description: 'Completed the Advanced ZK Compression Workshop.',
    event: 'ZK Workshop Series',
    claimedAt: '2025-04-05T16:45:00Z',
    imageUrl: 'https://placehold.co/400x400/3A3E6C/FFFFFF/png?text=SWC',
  },
];

export default function MyTokensPage() {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<typeof mockTokens>([]);

  useEffect(() => {
    const loadTokens = async () => {
      if (!connected || !publicKey) return;

      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call to fetch tokens
        // owned by the connected wallet from the blockchain
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Using mock data for now
        setTokens(mockTokens);
      } catch (error) {
        console.error('Error loading tokens:', error);
        toast.error('Failed to load your tokens');
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">My Tokens</h1>
        <p className="mb-8 text-muted-foreground">Connect your wallet to view your cTokens.</p>
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <p className="mb-4">Please connect your wallet to continue</p>
              <p className="text-sm text-muted-foreground">You need to connect a wallet to view your tokens.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Tokens</h1>
        <p className="text-muted-foreground mb-8">
          View all your proof-of-participation compressed tokens (cTokens)
        </p>

        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild>
                <a href="/scan">Scan QR Code</a>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center p-12">
              <p>Loading your tokens...</p>
            </div>
          ) : tokens.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">No Tokens Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't claimed any cTokens yet. Scan a QR code at an event to get started.
                  </p>
                  <Button asChild>
                    <a href="/scan">Scan QR Code</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tokens.map(token => (
                    <Card key={token.id} className="overflow-hidden">
                      <div
                        className="aspect-square bg-cover bg-center"
                        style={{ backgroundImage: `url(${token.imageUrl})` }}
                      />
                      <CardHeader className="pt-4 pb-2">
                        <CardTitle className="text-lg">{token.name}</CardTitle>
                        <CardDescription>{token.symbol}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-2">{token.description}</p>
                        <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                          <span>Event: {token.event}</span>
                          <span>Claimed: {new Date(token.claimedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Your cTokens</CardTitle>
                    <CardDescription>
                      {tokens.length} token{tokens.length !== 1 ? 's' : ''} found for your wallet address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tokens.map(token => (
                        <div key={token.id} className="flex items-center p-3 border rounded-lg">
                          <div
                            className="w-12 h-12 rounded-md bg-cover bg-center mr-4"
                            style={{ backgroundImage: `url(${token.imageUrl})` }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{token.name} <span className="text-xs text-muted-foreground ml-1">({token.symbol})</span></h3>
                            <p className="text-xs text-muted-foreground">{token.event}</p>
                          </div>
                          <div className="text-xs text-right text-muted-foreground">
                            Claimed: {new Date(token.claimedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
