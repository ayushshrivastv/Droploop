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
      {/* Header - changed to have transparent background and absolute positioning */}
      <header className="absolute top-0 left-0 right-0 z-40 border-b border-gray-800/40 bg-black/10 backdrop-blur-sm">
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
      
      {/* Main content - removed padding to allow hero section to cover the full viewport */}
      <main className="flex-grow relative">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column */}
            <div>
              <h2 className="font-serif text-xl font-medium mb-4 text-white">Droploop</h2>
              <p className="text-gray-400 text-sm mb-4">
                High throughput token issuance and distribution platform powered by Light Protocol's state compression technology.
              </p>
            </div>
            
            {/* Middle column */}
            <div>
              <h3 className="font-serif text-lg font-medium mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Solana
                  </a>
                </li>
                <li>
                  <a href="https://lightprotocol.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Light Protocol
                  </a>
                </li>
                <li>
                  <a href="https://solana.pay" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Solana Pay
                  </a>
                </li>
                <li>
                  <a href="https://github.com/ayushshrivastv/Droploop/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Right column */}
            <div>
              <h3 className="font-serif text-lg font-medium mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://x.com/ayushsrivastv" target="_blank" rel="noopener noreferrer" aria-label="X">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-gray-400 hover:text-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/ayushshrivastv/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-white">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright line */}
          <div className="text-center mt-8 pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">© 2025 Ayush Srivastava</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
