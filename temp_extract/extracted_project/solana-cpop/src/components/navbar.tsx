'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from '@/components/solana/wallet-connect-button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Create', href: '/create' },
  { name: 'My Tokens', href: '/my-tokens' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl inline-block">cPOP</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
