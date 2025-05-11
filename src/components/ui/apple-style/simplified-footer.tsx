"use client";

import React from 'react';
import Link from 'next/link';
import { Linkedin, Github } from 'lucide-react';

interface FooterProps {
  className?: string;
}

/**
 * A simplified footer without any modal dialogs to prevent wallet connection issues
 */
export const SimplifiedFooter: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-black text-zinc-400 py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and brief description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight flex items-center">
                <span className="text-white">Decentralized</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">Droploop</span>
              </span>
            </Link>
            <p className="text-sm">
              High throughput token issuance and distribution platform powered by Light Protocol's state compression technology.
            </p>
          </div>
          
          {/* Resources links */}
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Solana
                </Link>
              </li>
              <li>
                <Link href="https://lightprotocol.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Light Protocol
                </Link>
              </li>
              <li>
                <Link href="https://solanapay.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Solana Pay
                </Link>
              </li>
              <li>
                <Link href="https://github.com/ayushshrivastv/Droploop/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  MIT License
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Connect section */}
          <div>
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com/ayushshrivastv/Droploop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/ayushshrivastv/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-zinc-800 mt-10 pt-6 text-center text-xs">
          <p>&copy; {currentYear} Ayush Srivastava</p>
        </div>
      </div>
    </footer>
  );
};
