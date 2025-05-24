"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { ParticlesBackground } from '@/components/ui/particles-background';

export default function DocumentationPage() {
  return (
    <AppleLayout>
      <ParticlesBackground />
      <section className="py-8 md:py-16 bg-black/30 backdrop-blur-sm">
        <div className="px-4 md:px-6 max-w-3xl mx-auto">
          <article className="space-y-6 text-left font-fredoka">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white font-sf-pro">
              Understanding Droploop System
            </h1>
            <div className="text-zinc-400 text-sm border-b border-zinc-800 pb-3">Technical Documentation · May 2025</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              The Droploop system represents a significant evolution in digital token distribution for events and communities. It addresses the core challenges that have historically limited token adoption: technical complexity, high costs, and slow processing speeds.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              At its foundation, the system leverages Solana's high-throughput blockchain and Light Protocol's state compression technology. This powerful combination enables the system to drastically reduce the on-chain storage requirements for tokens, resulting in lower costs and faster processing times.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8">The Compressed Token Architecture</h2>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              Unlike traditional tokens that store each token's data individually on-chain, compressed tokens utilize advanced cryptographic techniques to store thousands of token records in a single verifiable Merkle tree. This approach reduces the storage footprint by approximately 99% compared to standard SPL tokens.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              When an organizer creates tokens through Droploop, the system initializes a state tree that acts as a compressed database for token ownership and metadata. This tree is maintained by Light Protocol's infrastructure, which validates and processes all token transfers while ensuring cryptographic security and immutability.
            </p>
            
            <div className="p-4 bg-blue-950/20 rounded-lg my-8 text-zinc-300 leading-relaxed">
              <p className="text-base md:text-lg">
                <span className="font-bold text-blue-400">Technical Note:</span> The system automatically handles state tree initialization during the token claiming process. If no active state trees are found, one is created on-demand, eliminating the need for manual administrative intervention.
              </p>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-8">Resilient Token Distribution</h2>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              One of the most powerful features of Droploop is its resilient token distribution mechanism. It attempts to transfer compressed tokens first, but automatically falls back to standard SPL tokens if compression-related issues arise. This dual-method approach ensures that token distributions are always successful, regardless of the underlying technical conditions.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              For event organizers, this means your token distribution simply works - without requiring technical knowledge of blockchain infrastructure. The QR code-based claiming process is designed with simplicity in mind, allowing attendees to receive tokens in just a few clicks through their mobile devices.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8">Practical Applications</h2>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              The system's flexibility opens up numerous possibilities for events and communities:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-zinc-300 text-base md:text-lg">
              <li className="leading-relaxed"><span className="font-medium text-white">Proof-of-Attendance:</span> Issue tokens that verify physical or virtual attendance at events</li>
              <li className="leading-relaxed"><span className="font-medium text-white">Community Recognition:</span> Reward active community members with exclusive tokens</li>
              <li className="leading-relaxed"><span className="font-medium text-white">Loyalty Programs:</span> Create token-based incentive systems for repeat participation</li>
              <li className="leading-relaxed"><span className="font-medium text-white">Access Control:</span> Use tokens as keys to access exclusive content or areas</li>
            </ul>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed mt-8">
              By combining high-performance blockchain technology with an intuitive user interface, Droploop democratizes token distribution - making it accessible to organizers of all technical backgrounds. Whether you're managing a small meetup or a large-scale conference, the system scales to meet your needs without requiring specialized blockchain knowledge.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8">Future Developments</h2>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              The Droploop system continues to evolve with planned enhancements including multi-token batches, programmable claim conditions, and expanded analytics for event organizers. These improvements will further streamline the token distribution process while providing more flexibility and insights for organizers.
            </p>
            
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              As Web3 technology becomes more integrated with everyday experiences, systems like Droploop are leading the way in making blockchain-based digital assets accessible, practical, and valuable for both organizers and participants.
            </p>
          </motion.div>
        </article>
      </div>
    </section>
    </AppleLayout>
  );
}
