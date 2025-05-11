import type { ButtonHTMLAttributes, HTMLAttributes, RefAttributes, ReactNode } from 'react';
import type { ButtonProps } from '@/components/ui/button';
import type { CardProps } from '@/components/ui/card';

declare module '@/components/ui/button' {
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
    onClick?: () => void;
  }
}

declare module '@/components/ui/card' {
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardDescriptionProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
}

declare module '@/components/layouts/page-layout' {
  export interface PageLayoutProps {
    children: ReactNode;
    activePage?: string;
  }
}

declare module '@/components/layouts/apple-layout' {
  export interface AppleLayoutProps {
    children: ReactNode;
  }
}
