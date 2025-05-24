"use client";

import { useState } from 'react';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { ROUTES } from '@/lib/constants';
import { EventStatistics } from '@/components/dashboard/event-statistics';
import { RecipientList } from '@/components/dashboard/recipient-list';
import { ClaimAnalytics } from '@/components/dashboard/claim-analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function DashboardPage() {
  // State to track if the development banner is visible
  const [showDevBanner, setShowDevBanner] = useState(true);
  
  return (
    <AppleLayout>
      {/* Development Banner with padding from top */}
      <div className="pt-6"></div>
      {showDevBanner && (
        <div className="container mx-auto mb-6">
          <div className="w-full bg-white border border-blue-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-blue-500 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">This page is under development</p>
                  <p className="text-sm text-gray-700 mt-1">
                    The ZK Compression functionality is currently being implemented. Please check the <a href="https://docs.lightprotocol.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZK Compression documentation</a> to understand how compressed NFTs work. Light Protocol integration allows your application to seamlessly create and manage compressed tokens on Solana.
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setShowDevBanner(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="container mx-auto pt-4 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Event Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <p className="text-muted-foreground mb-4">
                Monitor your event tokens, track distributions, and manage recipients. This dashboard provides insights into your event&apos;s engagement and token distribution metrics.
              </p>

              <h3 className="font-medium text-lg mt-6 mb-2">Features</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Track token claims and distributions</li>
                <li>Monitor recipient activity</li>
                <li>View event analytics and statistics</li>
                <li>Manage token supply and airdrops</li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your wallet is connected to view your event data.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="statistics" className="border border-border rounded-lg p-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="statistics">Event Statistics</TabsTrigger>
                <TabsTrigger value="analytics">Claim Analytics</TabsTrigger>
                <TabsTrigger value="recipients">Token Recipients</TabsTrigger>
              </TabsList>
              
              <TabsContent value="statistics">
                <EventStatistics />
              </TabsContent>

              <TabsContent value="analytics">
                <ClaimAnalytics />
              </TabsContent>
              
              <TabsContent value="recipients">
                <RecipientList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
