"use client";

import * as React from 'react';
import { SidebarNav } from '@/components/ui/Webstyles/sidebar-nav';
import { SimplifiedFooter } from '@/components/ui/Webstyles/simplified-footer';
import { SmartWalletButton } from '@/components/wallet/smart-wallet-button';
import { ROUTES } from '@/lib/constants';

interface AppleLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Create Referral', href: ROUTES.MINT },
  { label: 'Claim Referral', href: ROUTES.CLAIM },
  { label: 'Documentation', href: ROUTES.DOCUMENTATION },
];

export const AppleLayout: React.FC<AppleLayoutProps> = ({ children }: AppleLayoutProps) => {
  return (
    <div className="min-h-screen bg-black text-foreground flex">
      {/* Sidebar Navigation */}
      <SidebarNav navItems={navItems} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-52"> {/* ml-52 matches the new width of the sidebar */}
        {/* Floating wallet button */}
        <div className="fixed top-6 right-6 z-50">
          <SmartWalletButton />
        </div>
        
        <main className="flex-grow px-8 md:px-12 lg:px-16 pt-8 md:pt-12 pb-8 md:pb-12">
          {children}
        </main>
        
        <SimplifiedFooter />
      </div>
    </div>
  );
};
