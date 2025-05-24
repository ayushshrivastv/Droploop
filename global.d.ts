// Type declarations for modules without type definitions
declare module 'framer-motion' {
  export const motion: {
    [key: string]: React.ComponentType<{ [key: string]: unknown }>;
  };
  export const AnimatePresence: React.ComponentType<{
    children?: React.ReactNode;
    mode?: 'sync' | 'popLayout' | 'wait';
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
  export function useAnimation(): {
    start: (definition: Record<string, unknown>) => Promise<void>;
    stop: () => void;
    [key: string]: unknown;
  };
  export function useScroll(): {
    scrollX: { get: () => number; onChange: (callback: (v: number) => void) => () => void };
    scrollY: { get: () => number; onChange: (callback: (v: number) => void) => () => void };
    [key: string]: unknown;
  };
  export function useTransform<T extends number | string>(
    value: { get: () => number; onChange: (callback: (v: number) => void) => () => void },
    input: number[],
    output: T[]
  ): { get: () => T; onChange: (callback: (v: T) => void) => () => void };
  export const useMotionValue: <T>(initial: T) => {
    get: () => T;
    set: (v: T) => void;
    onChange: (callback: (v: T) => void) => () => void;
  };
}

declare module 'lucide-react' {
  type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  };
  
  export const Menu: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const Github: React.FC<IconProps>;
  export const Twitter: React.FC<IconProps>;
  export const Linkedin: React.FC<IconProps>;
  export const Mail: React.FC<IconProps>;
  export const ChevronRight: React.FC<IconProps>;
  export const ChevronDown: React.FC<IconProps>;
  export const ExternalLink: React.FC<IconProps>;
  // Add any other icons used in the project
  export const Check: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const Copy: React.FC<IconProps>;
  export const QrCode: React.FC<IconProps>;
  export const Scan: React.FC<IconProps>;
}

declare module '@solana/wallet-adapter-react' {
  import { Connection, PublicKey, Transaction } from '@solana/web3.js';
  
  export interface WalletContextState {
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;
    disconnecting: boolean;
    select: (walletName: string) => void;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendTransaction: (transaction: Transaction, connection: Connection, options?: { signers?: Signer[] }) => Promise<string>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    [key: string]: unknown;
  }
  
  export interface ConnectionContextState {
    connection: Connection;
    [key: string]: unknown;
  }
  
  export function useWallet(): WalletContextState;
  export function useConnection(): ConnectionContextState;
}

declare module 'next/navigation' {
  export interface Router {
    push: (href: string, options?: { scroll?: boolean }) => void;
    replace: (href: string, options?: { scroll?: boolean }) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (href: string) => void;
    [key: string]: unknown;
  }
  
  export interface SearchParams {
    get: (key: string) => string | null;
    getAll: (key: string) => string[];
    has: (key: string) => boolean;
    forEach: (callback: (value: string, key: string) => void) => void;
    entries: () => IterableIterator<[string, string]>;
    keys: () => IterableIterator<string>;
    values: () => IterableIterator<string>;
    toString: () => string;
    [key: string]: unknown;
  }
  
  export function useRouter(): Router;
  export function useSearchParams(): SearchParams;
  export function usePathname(): string;
}

declare module 'next/link' {
  import { LinkProps as NextLinkProps } from 'next/dist/client/link';
  import React from 'react';
  
  const Link: React.ForwardRefExoticComponent<
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> &
    NextLinkProps & { children?: React.ReactNode } &
    React.RefAttributes<HTMLAnchorElement>
  >;
  
  export default Link;
}

declare namespace NodeJS {
  // Use Record<never, never> instead of empty interface to satisfy the linter
  // This represents an opaque type that the Node.js API returns for timeouts
  type Timeout = object
  interface Process {
    env: {
      NEXT_PUBLIC_SENDER_PRIVATE_KEY?: string;
      [key: string]: string | undefined;
    };
  }
}
