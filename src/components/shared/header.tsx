"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from '@/components/ui/wallet-connect-button';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';

// Utility function for className concatenation
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Define routes directly to ensure they're available
const routes = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/mint', label: 'Mint' },
  { path: '/claim', label: 'Claim' },
  { path: '/test-qr', label: 'QR Testing' },
];

/**
 * Main application header with navigation
 */
export function Header() {
  const pathname = usePathname(); // Use Next.js pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if a route is active
  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm' : 'bg-background'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">cToken</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(route.path) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}

            {/* Development/Testing Links */}
            {process.env.NODE_ENV === 'development' && (
              <div className="relative group">
                <button className="text-sm font-medium text-lime-600 hover:text-lime-500 transition-colors">
                  Testing
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link
                      href="/test-claim"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActive("/test-claim")
                          ? "text-lime-500"
                          : "text-lime-700"
                      )}
                    >
                      Test Claim
                    </Link>
                    <Link
                      href="/integration-test"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActive("/integration-test")
                          ? "text-lime-500"
                          : "text-lime-700"
                      )}
                    >
                      Integration Test
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <WalletConnectButton />
          </div>
          <ThemeToggleButton />

          {/* Mobile Menu Button */}
          <button
            className="flex items-center md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${mobileMenuOpen ? 'hidden' : 'block'}`}>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${mobileMenuOpen ? 'block' : 'hidden'}`}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-background border-t border-border`}>
        <div className="container py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(route.path) ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            {/* Mobile Testing Links */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <div className="border-t border-border/40 my-2"></div>
                <Link
                  href="/test-claim"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/test-claim")
                      ? "text-lime-500"
                      : "text-lime-700"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Test Claim
                </Link>
                <Link
                  href="/integration-test"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/integration-test")
                      ? "text-lime-500"
                      : "text-lime-700"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Integration Test
                </Link>
              </>
            )}
          </nav>
          <div className="pt-4 border-t border-border">
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
