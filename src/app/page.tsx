"use client";

import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { ArticleLayout } from '@/components/layouts/article-layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <ArticleLayout>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center">
        <div className="container max-w-3xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-serif font-medium mb-6 tracking-tight text-white">Droploop</h1>
            <p className="text-2xl font-serif text-white mb-8">
              A decentralized referral system on Solana using ZK Compression with Light Protocol.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-lg font-medium">
                <Link href={`${ROUTES.MINT}?tab=campaign`} className="flex items-center">
                  Create Referral <span className="ml-2">→</span>
                </Link>
              </Button>
              <Button asChild className="bg-transparent text-white hover:bg-gray-900 border border-white rounded-full px-8 py-6 text-lg font-medium">
                <Link href={ROUTES.CLAIM} className="flex items-center">
                  Claim Token <span className="ml-2">→</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      


      {/* Main Article Section */}
      <section className="py-20 text-white">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6 tracking-tight">
              Revolutionizing Referral Programs with ZK Compression
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 font-serif">
              How Droploop is making community growth 1000x more efficient on Solana
            </p>
          </motion.div>
          
          <div className="prose prose-lg max-w-none font-serif">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-lg leading-relaxed text-white"
            >
              In the rapidly evolving landscape of Web3 communities, effective growth mechanisms are essential. 
              Traditional referral systems face significant challenges: high gas fees, limited scalability, and 
              complex user experiences. Droploop addresses these challenges head-on by leveraging Zero-Knowledge 
              compression technology on Solana.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-lg leading-relaxed text-white"
            >
              Our platform enables creators to launch referral campaigns with minimal cost while maintaining 
              security and transparency. Users can join through personalized QR codes, and both referrers and 
              new participants receive token rewards automatically—all at a fraction of the traditional cost.
            </motion.p>

            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-serif font-medium mt-12 mb-4 tracking-tight text-white"
            >
              The Problem with Traditional Referral Systems
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-lg leading-relaxed text-white"
            >
              Web3 projects have long struggled with efficient growth mechanisms. Traditional on-chain referral 
              programs face three critical limitations:
            </motion.p>

            <motion.ul 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="list-disc pl-6 mb-6 space-y-2 text-gray-200"
            >
              <li className="text-lg">High costs: Traditional NFTs or tokens on Solana require full on-chain storage, costing approximately 0.01-0.05 SOL per mint.</li>
              <li className="text-lg">Limited scalability: As communities grow, transaction fees and storage requirements become prohibitive.</li>
              <li className="text-lg">Complex user experience: Many systems require technical knowledge, creating barriers to adoption.</li>
            </motion.ul>

            <motion.blockquote 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border-l-4 border-gray-300 pl-4 italic my-8 text-xl text-gray-300"
            >
              The cost of running a 10,000-participant referral program with traditional methods would be approximately 
              50 SOL. With Droploop's ZK compression, the same program costs just 0.05 SOL—a 1000x reduction.
            </motion.blockquote>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black text-white">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-serif font-medium mb-6 tracking-tight">Key Features</h2>
            <p className="text-xl text-gray-300 font-serif">
              Droploop offers powerful tools for community growth through ZK compression
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border border-gray-700 p-6"
            >
              <h3 className="text-xl font-serif font-medium mb-3">QR Code Scanner Integration</h3>
              <p className="text-white mb-4">
                Seamlessly scan referral QR codes using your device camera. Our implementation uses HTML5-QRCode 
                for secure camera access with robust permission handling.
              </p>
              <ul className="list-disc pl-6 text-white space-y-1">
                <li>Multi-format support for different QR code types</li>
                <li>Automatic form population with scanned data</li>
                <li>Responsive camera interface</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="border border-gray-700 p-6"
            >
              <h3 className="text-xl font-serif font-medium mb-3">Airdrop Mode</h3>
              <p className="text-white mb-4">
                Distribute tokens directly without requiring referral codes. This gives event organizers 
                flexibility in how they distribute tokens to participants.
              </p>
              <ul className="list-disc pl-6 text-white space-y-1">
                <li>Simple toggle between referral and airdrop modes</li>
                <li>Dynamic UI adaptation based on active mode</li>
                <li>Streamlined claiming process</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border border-gray-700 p-6"
            >
              <h3 className="text-xl font-serif font-medium mb-3">Cost Efficiency</h3>
              <p className="text-white mb-4">
                Reduce storage costs by a factor of 1000x, enabling the creation of thousands of referral tokens 
                for fractions of a cent.
              </p>
              <ul className="list-disc pl-6 text-white space-y-1">
                <li>~0.000005 SOL per referral (vs ~0.005 SOL traditional)</li>
                <li>Support for campaigns with 100,000+ participants</li>
                <li>Minimal gas fees for all operations</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border border-gray-700 p-6"
            >
              <h3 className="text-xl font-serif font-medium mb-3">Security & Privacy</h3>
              <p className="text-white mb-4">
                Maintain the same security guarantees as traditional on-chain tokens through cryptographic proofs, 
                while keeping certain information private.
              </p>
              <ul className="list-disc pl-6 text-white space-y-1">
                <li>Zero-knowledge proofs for data validation</li>
                <li>Merkle tree verification for referral authenticity</li>
                <li>Secure wallet connection and transaction handling</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-serif font-medium mb-6 tracking-tight">Ready to grow your community?</h2>
            <p className="text-xl text-white font-serif mb-8">
              Launch your first referral campaign and start rewarding your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-white text-black hover:bg-gray-200 rounded-none">
                <Link href={`${ROUTES.MINT}?tab=campaign`}>Create Referral</Link>
              </Button>
              <Button asChild className="bg-white text-black hover:bg-gray-200 rounded-none">
                <Link href={ROUTES.CLAIM}>Claim Referral</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </ArticleLayout>
  );
}
