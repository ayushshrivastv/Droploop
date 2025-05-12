"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { WalletConnectButton } from '@/components/ui/wallet-connect-button';

interface ArticleLayoutProps {
  children?: ReactNode;
}

export const ArticleLayout: React.FC<ArticleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href={ROUTES.HOME} className="font-serif text-2xl font-medium text-white">
            Droploop
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={ROUTES.HOME}
              className="text-white hover:text-gray-300 font-serif"
            >
              Home
            </Link>
            <Link 
              href={ROUTES.MINT}
              className="text-white hover:text-gray-300 font-serif"
            >
              Create Campaign
            </Link>
            <Link 
              href={ROUTES.CLAIM}
              className="text-white hover:text-gray-300 font-serif"
            >
              Claim Referral
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <WalletConnectButton className="bg-white text-black hover:bg-gray-200 rounded-none" />
            </div>
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu (hidden by default) */}
      <div className="md:hidden hidden bg-black border-b border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex flex-col space-y-4">
            <Link href={ROUTES.HOME} className="text-gray-300 hover:text-white font-serif py-2">
              Home
            </Link>
            <Link href={ROUTES.MINT} className="text-gray-300 hover:text-white font-serif py-2">
              Create Campaign
            </Link>
            <Link href={ROUTES.CLAIM} className="text-gray-300 hover:text-white font-serif py-2">
              Claim Referral
            </Link>
            <div className="pt-2">
              <WalletConnectButton className="bg-white text-black hover:bg-gray-200 rounded-none w-full" />
            </div>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 mt-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-lg font-medium mb-4 text-white">Droploop</h3>
              <p className="text-white mb-4">
                A decentralized referral system on Solana using ZK Compression with Light Protocol.
              </p>
            </div>
            
            <div>
              <h3 className="font-serif text-lg font-medium mb-4 text-white">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href={ROUTES.HOME} className="text-white hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.MINT} className="text-white hover:text-white">
                    Create Campaign
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.CLAIM} className="text-white hover:text-white">
                    Claim Referral
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-serif text-lg font-medium mb-4 text-white">About</h3>
              <p className="text-white mb-4">
                Built for the 1000x Hackathon ZK Compression Track.
              </p>
              <p className="text-white">
                © 2025 Droploop
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
