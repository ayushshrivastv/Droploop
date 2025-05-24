"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * TokenStatistics component - styled to match the application design theme
 * Displays statistics about tokens minted by the user
 */
export function TokenStatistics() {
  // Always call hooks unconditionally - this is required by React's Rules of Hooks
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalTokensMinted: number;
    tokensDistributed: number;
    activeEvents: number;
  } | null>(null);
  
  // Mark when component is client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract wallet properties safely
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;

  // Function to fetch token statistics
  const fetchTokenStats = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      // This would be replaced with actual API calls to fetch statistics
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - would be replaced with actual API response
      setStats({
        totalTokensMinted: 1500,
        tokensDistributed: 750,
        activeEvents: 3
      });
    } catch (error) {
      console.error("Error fetching token stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenStats();
    } else {
      setStats(null);
    }
  }, [connected, publicKey]);

  return (
    <div className="border border-border rounded-lg p-6 mt-8 bg-black">
      <h2 className="text-xl font-semibold mb-6">Referral Statistics</h2>
      
      <div className="bg-[#121212] rounded-lg border border-dashed border-gray-800 overflow-hidden">
        {!connected ? (
          <div className="p-8 flex items-center justify-center min-h-[160px]" data-component-name="TokenStatistics">
            <p className="text-gray-400 text-center">Connect your wallet to view your referral statistics</p>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center min-h-[160px]" data-component-name="TokenStatistics">
            <p className="text-gray-400 text-center font-medium text-xl">Coming Soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
