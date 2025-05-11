"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const ReadmeShowcase: React.FC = () => {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/80 -z-10" />
      
      {/* Subtle background image */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center -z-10"
        style={{ backgroundImage: 'url(/images/gradients/blue-purple-gradient.svg)' }}
      />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Overview</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Technical details about the Droploop referral system implementation
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left column - Project details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Core Functionality</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-blue-400 mb-2">Token Creation (Mint)</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    The token creation flow uses Light Protocol's compressed token standard to create cost-effective tokens on Solana:
                  </p>
                  <ul className="mt-2 space-y-1 text-zinc-400 text-sm list-disc pl-5">
                    <li>User connects their Solana wallet via the wallet adapter</li>
                    <li>User fills out event details in the mint form</li>
                    <li>Application creates a compressed token using Light Protocol's SDK</li>
                    <li>QR codes are generated for token distribution using Solana Pay URLs</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-blue-400 mb-2">Token Claiming</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    The token claiming process works as follows:
                  </p>
                  <ul className="mt-2 space-y-1 text-zinc-400 text-sm list-disc pl-5">
                    <li>Attendee scans a QR code or enters a claim code</li>
                    <li>Application validates the code against the blockchain</li>
                    <li>User connects their wallet to receive the token</li>
                    <li>Token is transferred to the user's wallet using compressed token transfer functions</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Compression Technology</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                At the core of our solution is Light Protocol's compression technology:
              </p>
              
              <ul className="space-y-3 text-zinc-400 text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Zero-Knowledge Proofs:</strong> Enables efficient on-chain storage while preserving cryptographic verification</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Merkle Tree Implementation:</strong> Organizes token data in compressed Merkle trees, allowing thousands of tokens to be represented by a single on-chain commitment</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Concurrent Minting:</strong> Supports parallel token issuance without chain congestion</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Verifiable Ownership:</strong> Despite compression, tokens maintain full verifiability and composability with other Solana protocols</span>
                </li>
              </ul>
            </div>
          </motion.div>
          
          {/* Right column - Technical highlights & screenshots */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Scalability Highlights</h3>
              
              <ul className="space-y-3 text-zinc-400 text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Massive Throughput:</strong> Capable of supporting events with 10,000+ attendees through Light Protocol's compressed NFTs</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Cost Efficiency:</strong> 99.9% reduction in storage costs compared to traditional NFTs (approximately 0.000005 SOL per token vs 0.005 SOL)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Network Efficiency:</strong> Reduces on-chain storage requirements by up to 1000x while maintaining full L1 security guarantees</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span><strong className="text-white">Batch Processing:</strong> Optimized for high-volume token issuance with minimal network congestion</span>
                </li>
              </ul>
            </div>
            
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Technical Implementation</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-indigo-400 mb-2">UI Framework</h4>
                  <ul className="mt-1 space-y-1 text-zinc-400 text-sm list-disc pl-5">
                    <li>Tailwind CSS for styling</li>
                    <li>shadcn/ui for component primitives</li>
                    <li>Responsive design principles for mobile compatibility</li>
                    <li>Dark/light mode support via next-themes</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-indigo-400 mb-2">Security Considerations</h4>
                  <ul className="mt-1 space-y-1 text-zinc-400 text-sm list-disc pl-5">
                    <li>Wallet connections use standard Solana wallet adapter security practices</li>
                    <li>No private keys are stored in the application</li>
                    <li>All blockchain transactions require explicit user approval</li>
                    <li>Input validation is implemented for all user inputs</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
