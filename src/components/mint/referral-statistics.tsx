"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';

/**
 * ReferralStatistics component - styled to match the application design theme
 * Displays statistics about referral programs created by the user
 */
export function ReferralStatistics() {
  // Always call hooks unconditionally - this is required by React's Rules of Hooks
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalProgramsCreated: number;
    referralsProcessed: number;
    activePrograms: number;
  } | null>(null);
  
  // Mark when component is client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract wallet properties safely
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;

  // Function to fetch referral program statistics wrapped in useCallback
  const fetchReferralStats = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      // This would be replaced with actual API calls to fetch statistics
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - would be replaced with actual API response
      setStats({
        totalProgramsCreated: 15,
        referralsProcessed: 750,
        activePrograms: 3
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey]);

  // Fetch stats when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchReferralStats();
    } else {
      setStats(null);
    }
  }, [connected, publicKey, fetchReferralStats]);

  return (
    <div className="border border-border rounded-lg p-6 mt-8 bg-black">
      <h2 className="text-xl font-semibold mb-6">Referral Statistics</h2>
      
      <div className="bg-[#121212] rounded-lg border border-dashed border-gray-800 overflow-hidden">
        {!connected ? (
          <div className="p-8 flex items-center justify-center min-h-[160px]" data-component-name="ReferralStatistics">
            <p className="text-gray-400 text-center">Connect your wallet to view your referral statistics</p>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center min-h-[160px]" data-component-name="ReferralStatistics">
            <p className="text-gray-400 text-center font-medium text-xl">Coming Soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
