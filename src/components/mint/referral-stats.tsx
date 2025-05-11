"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ReferralData {
  totalReferrals: number;
  successfulClaims: number;
  totalRewards: number;
  conversionRate: number;
}

/**
 * ReferralStats Component
 * Displays statistics about the user's referral program
 */
export function ReferralStats() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralData>({
    totalReferrals: 0,
    successfulClaims: 0,
    totalRewards: 0,
    conversionRate: 0
  });

  // Fetch referral statistics from the blockchain or API
  useEffect(() => {
    // Skip if wallet is not connected
    if (!connected || !publicKey) {
      setLoading(false);
      return;
    }

    const fetchReferralStats = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call to fetch referral stats
        // For now, we're using mock data
        const mockStats = {
          totalReferrals: 25,
          successfulClaims: 18,
          totalRewards: 36, // 2 tokens per successful claim
          conversionRate: 72 // 72%
        };
        
        // Simulate API delay
        setTimeout(() => {
          setStats(mockStats);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error fetching referral stats:", error);
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [publicKey, connected]);

  if (!connected) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Connect your wallet to view your referral statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              title="Total QR Codes Generated" 
              value={stats.totalReferrals} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                  <path d="M12 14h.01" />
                </svg>
              } 
            />
            
            <StatCard 
              title="Successful Claims" 
              value={stats.successfulClaims} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              } 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              title="Conversion Rate" 
              value={`${stats.conversionRate}%`} 
              subtext="of QR codes resulted in claims"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
                  <path d="m2 16 6-6 4 4 8-8" />
                  <path d="M22 6v4h-4" />
                </svg>
              } 
            >
              <Progress value={stats.conversionRate} className="h-2 mt-2" />
            </StatCard>
            
            <StatCard 
              title="Total Rewards Earned" 
              value={stats.totalRewards} 
              subtext="Tokens from successful referrals"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-500">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12" />
                  <path d="M16 10H8" />
                </svg>
              } 
            />
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtext?: string;
  children?: React.ReactNode;
}

function StatCard({ title, value, icon, subtext, children }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-background/90">
            {icon}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
