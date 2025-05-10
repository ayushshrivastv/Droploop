'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Form schema validation
const formSchema = z.object({
  eventName: z.string().min(3, { message: 'Event name must be at least 3 characters' }),
  eventDescription: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  eventLocation: z.string().optional(),
  eventStartDate: z.string().min(1, { message: 'Start date is required' }),
  eventEndDate: z.string().min(1, { message: 'End date is required' }),
  tokenName: z.string().min(2, { message: 'Token name must be at least 2 characters' }),
  tokenSymbol: z.string().min(1, { message: 'Token symbol is required' }).max(10, { message: 'Token symbol must be at most 10 characters' }),
  tokenDescription: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  tokenSupply: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, { message: 'Supply must be a positive number' }),
});

export default function CreateEventPage() {
  const { publicKey, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: '',
      eventDescription: '',
      eventLocation: '',
      eventStartDate: '',
      eventEndDate: '',
      tokenName: '',
      tokenSymbol: '',
      tokenDescription: '',
      tokenSupply: '100',
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation using Solana program, we'd do:
      // import { initializeEvent } from '~/lib/solana-program';
      // import { api } from '~/lib/api';
      //
      // 1. Initialize event on Solana blockchain
      // const txSignature = await initializeEvent(
      //   wallet,
      //   values.eventName,
      //   values.tokenName,
      //   values.tokenSymbol,
      //   parseInt(values.tokenSupply),
      //   `https://example.com/events/${encodeURIComponent(values.eventName)}`,
      //   `https://example.com/tokens/${encodeURIComponent(values.tokenName)}`
      // );
      //
      // 2. Store event in database
      // const result = await api.post('/api/events', {
      //   name: values.eventName,
      //   description: values.eventDescription,
      //   location: values.eventLocation,
      //   startDate: values.eventStartDate,
      //   endDate: values.eventEndDate,
      //   tokenName: values.tokenName,
      //   tokenSymbol: values.tokenSymbol,
      //   tokenDescription: values.tokenDescription,
      //   tokenSupply: parseInt(values.tokenSupply),
      //   txSignature: txSignature,
      // });
      //
      // 3. Redirect to event page
      // router.push(`/events/${result.data.id}`);

      console.log("Creating event with values:", values);

      // Simulate API and blockchain calls
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Event created successfully! You can now generate QR codes.');
      // In a real implementation, redirect to the event management page
      // window.location.href = '/events/123'; // Replace 123 with actual event ID
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!connected) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Create a New Event</h1>
        <p className="mb-8 text-muted-foreground">Connect your wallet to create a new event and mint cTokens.</p>
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <p className="mb-4">Please connect your wallet to continue</p>
              <p className="text-sm text-muted-foreground">You need to connect a wallet to create events and mint cTokens.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Create a New Event</h1>
        <p className="mb-8 text-muted-foreground">
          Fill out the form below to create a new event and mint compressed tokens (cTokens) for participants.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  Basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Solana Hackathon 2025" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your event as it will appear to participants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Join us for the largest Solana hackathon of the year..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your event to help participants understand what it's about
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Virtual or physical location" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where will the event take place?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Details</CardTitle>
                <CardDescription>
                  Configure the compressed tokens (cTokens) for your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Hackathon Participant Token" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the token participants will receive
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="HPT" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short symbol for your token (max 10 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="This token certifies participation in the Solana Hackathon 2025..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what this token represents to participants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Supply</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        The maximum number of tokens that can be claimed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Event & Mint Tokens'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
