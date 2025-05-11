"use client";

import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { HeroSection } from '@/components/ui/apple-style/hero-section';
import { FeatureSection } from '@/components/ui/apple-style/feature-section';
import { SpecGrid } from '@/components/ui/apple-style/spec-grid';
import { CTASection } from '@/components/ui/apple-style/cta-section';
import { ReadmeShowcase } from '@/components/ui/apple-style/readme-showcase';
import { BenefitsTable } from '@/components/ui/apple-style/benefits-table';
import { FeatureHighlight } from '@/components/ui/apple-style/feature-highlight';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { motion } from 'framer-motion';

// Icon components for feature section
const ZkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M6 12h12"/>
    <path d="M8 10v4"/>
    <path d="M16 10v4"/>
  </svg>
);

const QrIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const TokenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const specItems = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Dual Rewards',
    description: 'Automatically reward both referrers and new joiners with compressed tokens.',
  },
  {
    icon: <QrIcon />,
    title: 'QR Code Referrals',
    description: 'Generate unique QR codes for each referrer to share and track their referrals.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    title: 'Custom Campaigns',
    description: 'Create personalized referral campaigns with your branding and reward structure.',
  },
  {
    icon: <TokenIcon />,
    title: 'Campaign Metadata',
    description: 'Attach detailed information to your campaigns for transparent referral tracking.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Fraud Prevention',
    description: 'Secure verification ensures only legitimate referrals receive rewards.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2Z"/>
        <path d="M21.17 8H12V2.83c2 .17 4.3 1.53 5.5 2.75 2.1 2.07 3.5 3.9 3.67 5.42Z"/>
      </svg>
    ),
    title: 'Referral Analytics',
    description: 'Track campaign performance with detailed metrics on conversions, rewards, and engagement.',
  },
];

// Benefits metrics data for comparison table
const benefitsMetrics = [
  {
    metric: 'Storage Cost per Referral',
    traditional: '~0.005 SOL',
    scalable: '~0.000005 SOL',
    improvement: '1000x reduction'
  },
  {
    metric: 'Referrals per Transaction',
    traditional: '1',
    scalable: 'Up to 1,000',
    improvement: '1000x throughput'
  },
  {
    metric: 'Gas Fees for 10,000 Referrals',
    traditional: '~50 SOL',
    scalable: '~0.05 SOL',
    improvement: '1000x savings'
  },
  {
    metric: 'Referral Verification Time',
    traditional: '2-5 seconds',
    scalable: '2-5 seconds',
    improvement: 'Equal UX'
  },
  {
    metric: 'Maximum Campaign Size',
    traditional: '~1,000 participants',
    scalable: '100,000+ participants',
    improvement: '100x scalability'
  }
];

export default function Home() {
  // Custom title component with gradient styling
  const heroTitle = (
    <div className="space-y-2">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold tracking-tight text-white"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600">Droploop</span>
      </motion.h1>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-3xl md:text-5xl font-bold tracking-tight text-white"
      >
        Decentralized Referral System
      </motion.h2>
    </div>
  );

  return (
    <AppleLayout>
      {/* Particles background */}
      <ParticlesBackground />
      
      {/* Hero section */}
      <HeroSection
        title={heroTitle}
        subtitle="A decentralized referral system on Solana using ZK Compression with Light Protocol for community growth."
        primaryButtonText="Create Referral"
        primaryButtonLink={`${ROUTES.MINT}?tab=campaign`}
        secondaryButtonText="Claim Referral"
        secondaryButtonLink={ROUTES.CLAIM}
        showParticles={true}
      />

      {/* Feature section */}
      <div className="flex items-center justify-center py-16 bg-black/30">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
            ZK Compression for Scalable Referrals
          </h2>
          <p className="text-xl text-center text-zinc-300 max-w-3xl mx-auto mb-12">
            Leverage Light Protocol's ZK compression technology to create referral campaigns at 1/1000th the cost 
            while maintaining full security and transparency on Solana.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-black/20 rounded-xl p-6 border border-gray-800 backdrop-blur-sm">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <ZkIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Community Growth</h3>
              <p className="text-zinc-400">Incentivize users to invite others and grow your community through rewards.</p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 border border-gray-800 backdrop-blur-sm">
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <QrIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">QR Code Referrals</h3>
              <p className="text-zinc-400">Allow easy sharing through personalized referral QR codes for each participant.</p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 border border-gray-800 backdrop-blur-sm">
              <div className="h-12 w-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TokenIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Automatic Rewards</h3>
              <p className="text-zinc-400">Distribute compressed tokens to both referrers and new users automatically.</p>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-8 border border-gray-800 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-4 text-white">Solana Smart Contract Integration</h3>
            <p className="text-zinc-300 mb-4">Built on Solana's high-performance blockchain for lightning-fast, low-cost transactions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Light Protocol Integration</h4>
                  <p className="text-zinc-400">Leverages ZK proofs for secure and efficient compressed state management.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Merkle Tree Verification</h4>
                  <p className="text-zinc-400">Uses cryptographic proofs to validate referral authenticity without revealing data.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-8 w-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Gas-Efficient Claims</h4>
                  <p className="text-zinc-400">Optimized token transfers, costing just fractions of a cent per claim.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-8 w-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Wallet-to-Wallet Transfers</h4>
                  <p className="text-zinc-400">Direct token transfers between referrers and participants without intermediaries.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Feature Highlight */}
      <FeatureHighlight
        title="Personalized Referral QR Codes"
        description="Seamless referral sharing with personalized QR codes that encode referral data for instant attribution and rewards."
        subtitle="Share and track with ease"
        primaryColor="purple"
        secondaryColor="pink"
        items={[
          {
            title: "Unique Generation",
            description: "Each participant receives a personalized QR code with their referral code embedded for accurate tracking.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            )
          },
          {
            title: "Instant Recognition",
            description: "QR codes are instantly recognized by any QR scanner, making joining through referrals easy for anyone.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            )
          },
          {
            title: "Referral Embedding",
            description: "Each QR code contains all necessary referral data for accurate attribution and seamless campaign joining.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            )
          },
          {
            title: "Wallet Connectivity",
            description: "QR codes connect to the user's Solana wallet when scanned, enabling automatic reward distribution.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <path d="M6 12h12"/>
              </svg>
            )
          },
          {
            title: "Multi-Channel Sharing",
            description: "Referral codes can be shared via QR codes, direct links, or text, maximizing distribution opportunities.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            )
          },
          {
            title: "Fraud Prevention",
            description: "Built-in security measures prevent abuse of the referral system, ensuring only legitimate referrals earn rewards.",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            )
          },
        ]}
      />
      {/* Benefits Table */}
      <BenefitsTable metrics={benefitsMetrics} />
      {/* Specs Grid */}
      <SpecGrid
        title="Referral Features"
        subtitle="Powerful tools to grow your community through incentivized sharing"
        items={specItems}
      />
      {/* README Showcase */}
      <ReadmeShowcase />
      {/* CTA Section */}
      <CTASection
        title="Ready to grow your community?"
        description="Launch your first referral campaign and start rewarding your community."
        primaryButtonText="Create Referral"
        primaryButtonLink={`${ROUTES.MINT}?tab=campaign`}
        secondaryButtonText="Claim Referral"
        secondaryButtonLink={ROUTES.CLAIM}
      />
    </AppleLayout>
  );
}
