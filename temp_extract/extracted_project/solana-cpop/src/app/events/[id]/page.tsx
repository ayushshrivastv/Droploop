'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Mock event data
const mockEvent = {
  id: 'event_123456789',
  name: 'Solana Hackathon 2025',
  description: 'Join us for the largest Solana hackathon of the year, featuring workshops, speakers, and exciting challenges. Participants will have the opportunity to build innovative projects using the latest Solana technologies, including ZK Compression.\n\nThe hackathon will include:\n- Technical workshops\n- Mentorship sessions\n- Networking opportunities\n- Exciting prizes for winning projects',
  location: 'Virtual Event',
  startDate: '2025-05-15T09:00:00Z',
  endDate: '2025-05-18T18:00:00Z',
  imageUrl: 'https://placehold.co/1200x400/3A3E6C/FFFFFF/png?text=Solana+Hackathon',
  creator: 'Solana Foundation',
  creatorWallet: 'aBc123...XyZ789',
  participantCount: 450,
  isCreator: true,
};

// Mock token data
const mockToken = {
  id: 'token_987654321',
  name: 'Hackathon Participant Token',
  symbol: 'HPT',
  description: 'This token certifies participation in the Solana Hackathon 2025.',
  maxSupply: 1000,
  claimedCount: 48,
  imageUrl: 'https://placehold.co/400x400/3A3E6C/FFFFFF/png?text=HPT',
};

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<typeof mockEvent | null>(null);
  const [token, setToken] = useState<typeof mockToken | null>(null);

  useEffect(() => {
    const loadEventDetails = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call to fetch the event
        // with the given ID from the database or blockchain
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Using mock data
        setEvent(mockEvent);
        setToken(mockToken);
      } catch (error) {
        console.error('Error loading event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="mb-8 text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        <Link href="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div
            className="h-64 w-full bg-cover bg-center rounded-lg mb-6"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Dates:</span> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {event.location}
                </div>
                <div>
                  <span className="font-medium">Participants:</span> {event.participantCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {event.isCreator && (
                <>
                  <Link href={`/events/${event.id}/qrcodes`}>
                    <Button>Manage QR Codes</Button>
                  </Link>
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="outline">Edit Event</Button>
                  </Link>
                </>
              )}
              {!event.isCreator && (
                <Link href="/scan">
                  <Button>Scan QR Code</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    {event.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-2">Event Creator</h3>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span>{event.creator.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{event.creator}</p>
                        <p className="text-xs text-muted-foreground">{event.creatorWallet}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Participation Token</CardTitle>
                <CardDescription>
                  Claim this compressed token (cToken) by scanning a QR code at the event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {token && (
                    <>
                      <div className="aspect-square bg-cover bg-center rounded-lg overflow-hidden border"
                        style={{ backgroundImage: `url(${token.imageUrl})` }}
                      />

                      <div>
                        <h3 className="font-medium mb-1">{token.name} ({token.symbol})</h3>
                        <p className="text-sm text-muted-foreground mb-3">{token.description}</p>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Supply:</span>
                          <span>{token.maxSupply}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Claimed:</span>
                          <span>{token.claimedCount}</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Link href="/scan">
                          <Button className="w-full">Scan QR to Claim</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
