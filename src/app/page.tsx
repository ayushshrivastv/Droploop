"use client";

import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { HeroSection } from '@/components/ui/Webstyles/hero-section';
import { FeatureSection } from '@/components/ui/Webstyles/feature-section';
import { SpecGrid } from '@/components/ui/Webstyles/spec-grid';
import { CTASection } from '@/components/ui/Webstyles/cta-section';
import { ReadmeShowcase } from '@/components/ui/Webstyles/readme-showcase';
import { BenefitsChart } from '@/components/ui/Webstyles/benefits-chart';
import { FeatureHighlight } from '@/components/ui/Webstyles/feature-highlight';
// Removed ParticlesBackground import
import { motion } from 'framer-motion';
import { QuantifiedBenefits } from '@/components/ui/Webstyles/quantified-benefits';

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
    title: 'Tiered Rewards',
    description: 'Create multi-level referral programs with customizable reward structures for different tiers.',
  },
  {
    icon: <QrIcon />,
    title: 'QR Code Sharing',
    description: 'Generate dynamic QR codes that referrers can share to instantly track and reward referrals.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    title: 'Custom Branding',
    description: 'Personalize referral NFTs with your brand identity and program details for a professional look.',
  },
  {
    icon: <TokenIcon />,
    title: 'Program Metadata',
    description: 'Attach detailed program information to referral NFTs, creating transparent reward structures.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Fraud Prevention',
    description: 'Secure verification ensures only legitimate referrals are rewarded, preventing abuse.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2Z"/>
        <path d="M21.17 8H12V2.83c2 .17 4.3 1.53 5.5 2.75 2.1 2.07 3.5 3.9 3.67 5.42Z"/>
      </svg>
    ),
    title: 'Analytics Dashboard',
    description: 'Track referral performance and reward distribution with real-time analytics.',
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
    metric: 'Referral Confirmation Time',
    traditional: '2-5 seconds',
    scalable: '2-5 seconds',
    improvement: 'Equal UX'
  },
  {
    metric: 'Maximum Program Size',
    traditional: '~1,000 referrals',
    scalable: '100,000+ referrals',
    improvement: '100x scalability'
  },
  {
    metric: 'Reward Distribution Speed',
    traditional: '~10 rewards/min',
    scalable: '~5,000 rewards/min',
    improvement: '500x faster'
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
        Droploop
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
      {/* Particles background removed */}
      {/* Hero Section */}
      <HeroSection
        title={heroTitle}
        subtitle="Grow your community with a decentralized referral program powered by Solana and Light Protocol's compression technology"
      />

      {/* Project Overview Section */}
      <section className="py-8 md:py-16 bg-black/30 backdrop-blur-sm">
        <div className="px-4 md:px-6 max-w-3xl mx-auto">
          <article className="space-y-6 text-left font-fredoka">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white font-sf-pro">
                Droploop Decentralized Referral System
              </h1>
              <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Posted by Ayush Srivastava · May 25</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                At the intersection of community growth and blockchain technology, a new platform is revolutionizing how businesses build referral programs. Droploop's decentralized referral system makes creating, managing, and rewarding referrals as simple as scanning a QR code.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The concept was born from recurring challenges faced by businesses and creators — many of whom wanted to leverage the power of community-driven growth but were hindered by technical barriers: complex reward tracking, unreliable attribution, and high implementation costs.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>A Simple Share, A Powerful Reward System</strong><br />
                Droploop rewrites the referral program narrative. Built on the high-speed Solana blockchain and leveraging Light Protocol's zero-knowledge compression, the system allows businesses to create and manage referral NFTs that automatically track and reward referrals — with minimal costs and near-instant confirmation.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The infrastructure compresses thousands of referral records into a single verifiable on-chain state, dramatically reducing storage requirements and costs. Program creators simply input program details, customize reward parameters through an intuitive dashboard, and generate QR codes that referrers can share with their networks to instantly track referrals and distribute rewards.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                "It's referral marketing reimagined," said one early user. "Thousands of referrals tracked automatically — and no one has to think about how it works. They just share, refer, and rewards are distributed instantly."
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>An Infrastructure for Community Growth</strong><br />
                Beyond technical innovation, Droploop is designed to make referral programs effortless — and community growth measurable. Businesses can deploy referral NFTs for a wide range of use cases: affiliate marketing, customer acquisition, community expansion, and tiered reward systems.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                With support for popular Solana wallets like Phantom, Backpack, and Solflare, users don't need to learn new tools. Referral NFTs and rewards are distributed instantly, creating a seamless experience for both referrers and those being referred.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                "People are naturally motivated to share things they love," said Natalie Chong, a marketing director who piloted the system for her SaaS product. "The referral program felt less like a marketing tactic and more like community building. Our users loved earning rewards for sharing — and we didn't have to worry about tracking or attribution."
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>Security Without Sacrificing Growth</strong><br />
                The platform integrates real-time analytics and fraud prevention through zero-knowledge proofs, ensuring every referral is secure and verifiable. Even with thousands of simultaneous referrals, the system remains fast, reliable, and transparent.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                The system's flexibility allows for creative customization — including tiered rewards, instant or milestone-based distributions, and transferable or non-transferable referral NFTs — all while maintaining rigorous verification standards.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                "In the past, we had to use centralized referral platforms that were expensive and inflexible," said José Medina, a growth marketer at a Web3 startup. "Now we just define the referral rules, and everything happens automatically — no manual tracking, no payment disputes."
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                <strong>Reclaiming the Power of Word-of-Mouth</strong><br />
                At its core, Droploop is less about technology and more about amplifying the most powerful marketing channel: personal recommendations. Every feature, from instant reward distribution to customizable referral parameters, is designed to let businesses focus on what truly matters: creating products and services worth sharing.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                Whether it's a small startup or a global enterprise, this platform offers a simple promise: create and manage referral programs as effortlessly as sharing a link — and watch your community grow organically.
              </p>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                As one early adopter put it, "Referral programs shouldn't be about complex implementation. They should be about rewarding your community for sharing what they love."
              </p>
            </motion.div>
          </article>
        </div>
      </section>

      {/* Compression Technology Section */}
      <section className="py-12 md:py-20 bg-black/30 backdrop-blur-sm">
        <div className="px-6 md:px-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white font-sf-pro">
              How Our Referral NFT Technology Works
            </h2>
            <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Technology Overview</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 font-fredoka"
          >
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              Droploop leverages Light Protocol's zero-knowledge compression technology to revolutionize referral programs on Solana. This cutting-edge approach combines the security of blockchain with the efficiency of advanced cryptographic techniques, enabling a new paradigm for referral tracking and reward distribution.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              At its core, our implementation uses zero-knowledge proofs to compress referral data while preserving its integrity and verifiability. This allows us to dramatically reduce on-chain storage requirements and transaction costs without sacrificing security or functionality. The system can process hundreds of referrals in a single transaction, making it ideal for viral growth campaigns and large-scale referral programs.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              Beyond efficiency, this technology enhances privacy by allowing selective disclosure of information. Businesses can verify referral authenticity without exposing sensitive user data, while participants can prove their referrals without revealing personal details. The entire system is built on cryptographic guarantees that mathematically prevent fraud or unauthorized modifications.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              <strong>Quantifiable Results:</strong> With our referral NFT technology, we've achieved a 1000× reduction in cost, 500× increase in processing speed, and 100× decrease in storage requirements compared to traditional referral systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 md:py-20 bg-black/30 backdrop-blur-sm">
        <div className="px-6 md:px-10 max-w-3xl mx-auto">
          <div className="aspect-video">
            <video 
              className="w-full rounded-lg shadow-xl" 
              controls 
              preload="auto"
              playsInline
              muted
              autoPlay={false}
              controlsList="nodownload"
              disablePictureInPicture
              disableRemotePlayback
            >
              <source src="/Champ.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* CTA Section removed as requested */}
    </AppleLayout>
  );
}
