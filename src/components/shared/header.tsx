"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WalletConnectButton } from '@/components/ui/wallet-connect-button';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { Linkedin, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  activePage?: string;
}

export const Header: FC<HeaderProps> = ({ activePage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between py-4">
        {/* Logo and app name with white + gradient style */}
        <div className="flex items-center">
          <Link href={ROUTES.HOME} className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600">Droploop</span>
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href={ROUTES.MINT}
            className={`text-sm font-medium transition-colors hover:text-primary ${activePage === ROUTES.MINT ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Create Campaign
          </Link>
          <Link 
            href={ROUTES.CLAIM}
            className={`text-sm font-medium transition-colors hover:text-primary ${activePage === ROUTES.CLAIM ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Join Referral
          </Link>
        </nav>

        {/* Right section - actions */}
        <div className="flex items-center gap-4">
          <Link 
            href="https://www.linkedin.com/in/ayushshrivastv/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center text-white bg-[#0077b5] rounded-md p-2 hover:bg-[#0066a0] transition-colors"
            aria-label="Connect on LinkedIn"
          >
            <Linkedin size={18} />
          </Link>
          <div className="hidden sm:block">
            <WalletConnectButton />
          </div>
          <ThemeToggleButton />
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-background border-b border-border/40 animate-in slide-in-from-top-5 duration-300">
          <nav className="flex flex-col space-y-4 pb-4">
            <Link 
              href={ROUTES.MINT}
              className={`text-sm font-medium transition-colors hover:text-primary ${activePage === ROUTES.MINT ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Campaign
            </Link>
            <Link 
              href={ROUTES.CLAIM}
              className={`text-sm font-medium transition-colors hover:text-primary ${activePage === ROUTES.CLAIM ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Join Referral
            </Link>
          </nav>
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Link 
              href="https://www.linkedin.com/in/ayushshrivastv/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center text-white bg-[#0077b5] rounded-md p-2 hover:bg-[#0066a0] transition-colors"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin size={18} />
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      )}
    </header>
  );
};
