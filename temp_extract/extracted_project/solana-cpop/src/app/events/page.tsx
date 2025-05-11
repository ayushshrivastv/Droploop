'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Mock events data
const mockEvents = [
  {
    id: 'event_123456789',
    name: 'Solana Hackathon 2025',
    description: 'Join us for the largest Solana hackathon of the year, featuring workshops, speakers, and exciting challenges.',
    location: 'Virtual Event',
    startDate: '2025-05-15T09:00:00Z',
    endDate: '2025-05-18T18:00:00Z',
    imageUrl: 'https://placehold.co/800x400/3A3E6C/FFFFFF/png?text=Solana+Hackathon',
    creator: 'Solana Foundation',
    participantCount: 450,
  },
  {
    id: 'event_987654321',
    name: 'Solana Conference 2025',
    description: 'The annual Solana Conference brings together developers, entrepreneurs, and enthusiasts from around the world.',
    location: 'New York, NY',
    startDate: '2025-04-20T08:00:00Z',
    endDate: '2025-04-22T18:00:00Z',
    imageUrl: 'https://placehold.co/800x400/3A3E6C/FFFFFF/png?text=Solana+Conference',
    creator: 'Solana Events Team',
    participantCount: 1200,
  },
  {
    id: 'event_456789123',
    name: 'ZK Workshop Series',
    description: 'Learn about ZK Compression and how to build scalable applications on Solana.',
    location: 'San Francisco, CA',
    startDate: '2025-04-05T10:00:00Z',
    endDate: '2025-04-05T17:00:00Z',
    imageUrl: 'https://placehold.co/800x400/3A3E6C/FFFFFF/png?text=ZK+Workshop',
    creator: 'ZK Developers Community',
    participantCount: 75,
  },
  {
    id: 'event_321654987',
    name: 'Solana DeFi Summit',
    description: 'Explore the future of decentralized finance on the Solana blockchain.',
    location: 'London, UK',
    startDate: '2025-06-10T09:00:00Z',
    endDate: '2025-06-11T18:00:00Z',
    imageUrl: 'https://placehold.co/800x400/3A3E6C/FFFFFF/png?text=DeFi+Summit',
    creator: 'Solana DeFi Alliance',
    participantCount: 300,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<typeof mockEvents>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Using mock data
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = searchQuery
    ? events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Events</h1>
            <p className="text-muted-foreground">
              Browse and participate in events with cToken proof-of-participation
            </p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Search events..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Link href="/create">
              <Button>Create Event</Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-12">
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No events found matching "${searchQuery}". Try a different search.`
                    : 'There are no active events at the moment.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden flex flex-col">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                />
                <CardHeader className="pb-2">
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-1">
                  <p className="text-sm mb-2">{event.description}</p>
                  <div className="text-sm text-muted-foreground mt-2">
                    <div>Location: {event.location}</div>
                    <div>Created by: {event.creator}</div>
                    <div>Participants: {event.participantCount}</div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
