"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface HeroSectionProps {
  title: ReactNode;
  subtitle: string;
  backgroundImage?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  showParticles?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImage,
  primaryButtonText = "Create Referral",
  primaryButtonLink = ROUTES.MINT,
  secondaryButtonText = "Claim Referral",
  secondaryButtonLink = ROUTES.CLAIM,
  showParticles = false
}) => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background gradient similar to Apple's style */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black z-0" />
      
      {/* Optional background image with parallax effect */}
      {backgroundImage && (
        <motion.div 
          className="absolute inset-0 z-0 opacity-40"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Apple-style typography and positioning */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center max-w-5xl"
        >
          {/* Main title */}
          <div className="mb-6">
            {typeof title === 'string' ? (
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>

          {/* Subtitle with Apple's style of subtle gray text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-8"
          >
            {subtitle}
          </motion.p>
          
          {/* Action buttons like scale.com */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link 
              href={primaryButtonLink} 
              className="rounded-full bg-white hover:bg-white/90 px-8 py-3 text-base font-semibold text-black shadow-lg hover:shadow-white/25 transition-all duration-300 flex items-center justify-center min-w-[180px] group"
            >
              {primaryButtonText}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link 
              href={secondaryButtonLink} 
              className="px-8 py-3 text-base font-semibold text-white/80 hover:text-white transition-all duration-300 flex items-center justify-center min-w-[180px] group"
            >
              {secondaryButtonText}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
          
          {/* Apple-style scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-8"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M12 5L12 19M12 19L5 12M12 19L19 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
