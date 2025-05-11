"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PageLayout } from '@/components/layouts/page-layout';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [tokens, setTokens] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    successfulClaims: number;
    conversionRate: number;
    totalRewards: number;
  }>({ totalReferrals: 0, successfulClaims: 0, conversionRate: 0, totalRewards: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('tokens');

  // Mock data loading for demonstration
  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        // Mock token data
        setTokens([
          {
            id: '1',
            name: 'Droploop Referral Token',
            symbol: 'DROP',
            amount: 42,
            campaign: 'Community Growth',
            date: 'May 11, 2025',
            image: 'https://picsum.photos/300/200?random=1',
          },
          {
            id: '2',
            name: 'Droploop Reward Token',
            symbol: 'DROP',
            amount: 18,
            campaign: 'Early Adopter',
            date: 'May 5, 2025',
            image: 'https://picsum.photos/300/200?random=2',
          },
        ]);
        
        // Mock referral data
        setReferrals([
          {
            id: 'ref_Ax7Zb3_cDe5Fg2_r4nd0m',
            campaign: 'Community Growth',
            campaignId: 'BvTzP8UcKgX5d1YuJj3qZYrHMQfoG6vhGK5zPYQM6gKi',
            created: 'May 10, 2025',
            claims: 8,
            reward: 16,
          },
          {
            id: 'ref_Qw3Er7_tY6Ui9o_r4nd0m',
            campaign: 'Early Adopter',
            campaignId: 'Gk7yHfRt2qWs3ZxCvBn5mMjP9oLa6dK4fgH8jE1zYuIo',
            created: 'May 3, 2025',
            claims: 5,
            reward: 10,
          },
        ]);
        
        // Mock referral stats
        setReferralStats({
          totalReferrals: 2,
          successfulClaims: 13,
          conversionRate: 72,
          totalRewards: 26,
        });
        
        setLoading(false);
      }, 1000);
    } else {
      setTokens([]);
      setReferrals([]);
      setReferralStats({ totalReferrals: 0, successfulClaims: 0, conversionRate: 0, totalRewards: 0 });
    }
  }, [connected, publicKey]);

  // Use a fragment wrapper for the content to fix the children prop error
  const content = (
    <div className="container mx-auto py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          
          {connected && publicKey && (
            <div className="mt-4 md:mt-0">
              <Button
                // This fixes the onClick prop error by using asChild and an anchor tag
                variant="outline"
                asChild
              >
                <a 
                  href={ROUTES.MINT}
                  className={cn("bg-white text-black hover:bg-slate-100")}
                >
                Create Referral Campaign
                </a>
              </Button>
            </div>
          )}
        </div>

        {!connected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your profile
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your profile data...</p>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="tokens">Your Tokens</TabsTrigger>
              <TabsTrigger value="referrals">Your Referrals</TabsTrigger>
            </TabsList>
            
            {/* Tokens Tab */}
            <TabsContent value="tokens">
              {tokens.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You don't have any tokens yet
                  </p>
                  <Button asChild>
                    <a href={ROUTES.CLAIM}>Join Through Referral</a>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tokens.map((token) => (
                    <div key={token.id}>
                      <Card>
                      <div className="overflow-hidden h-48">
                        <img
                          src={token.image}
                          alt={token.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{token.name}</CardTitle>
                        <CardDescription>Balance: {token.amount} {token.symbol}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Campaign:</span> {token.campaign}</p>
                          <p><span className="font-medium">Received:</span> {token.date}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm">
                          View Token Details
                        </Button>
                      </CardFooter>
                    </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Referrals Tab */}
            <TabsContent value="referrals">
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven't created any referrals yet
                  </p>
                  <Button asChild>
                    <a href={ROUTES.MINT}>Create Your First Referral</a>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Referral Stats */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Referral Statistics</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <StatCard 
                        title="Active Referral Links" 
                        value={referralStats.totalReferrals} 
                        iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                      
                      <StatCard 
                        title="Successful Claims" 
                        value={referralStats.successfulClaims}
                        iconPath="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                      
                      <StatCard 
                        title="Conversion Rate" 
                        value={`${referralStats.conversionRate}%`}
                        iconPath="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      >
                        <Progress value={referralStats.conversionRate} className="h-1.5 mt-2" />
                      </StatCard>
                      
                      <StatCard 
                        title="Total Rewards Earned" 
                        value={referralStats.totalRewards}
                        iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </div>
                  </div>
                  
                  {/* Referral Links */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Your Referral Links</h2>
                    
                    <div className="space-y-4">
                      {referrals.map((referral) => (
                        <div key={referral.id}>
                          <Card>
                          <CardHeader>
                            <CardTitle>{referral.campaign}</CardTitle>
                            <CardDescription>Created: {referral.created}</CardDescription>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Referral Code:</span>
                                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                  {referral.id}
                                </code>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Successful Claims:</span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {referral.claims} users
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Rewards Earned:</span>
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {referral.reward} tokens
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          
                          <CardFooter>
                            <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button size="sm" variant="outline" onClick={() => {}} asChild>
                              <a style={{ backgroundColor: 'white', color: 'black' }}>
                              View QR Code
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {}} asChild>
                              <a>
                                Copy Link
                              </a>
                            </Button>
                            </div>
                          </CardFooter>
                        </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
  );
  
  // Return the page with properly typed children prop
  return (
    <PageLayout 
      activePage={ROUTES.PROFILE as keyof typeof ROUTES}
      children={content}
    />
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  iconPath: string;
  children?: React.ReactNode;
}

const StatCard: FC<StatCardProps> = ({ title, value, iconPath, children }) => {
  return (
    <Card>
      <CardContent>
        <div style={{ paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{title}</p>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', borderRadius: '9999px', background: 'var(--background)' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ color: 'var(--primary)' }}
              >
                <path d={iconPath} />
              </svg>
            </span>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</h3>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
