"use client";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DocsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar Navigation */}
            <aside className="md:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold mb-4">Documentation</h2>
                <nav className="space-y-1">
                  {[
                    { id: "introduction", label: "Introduction" },
                    { id: "getting-started", label: "Getting Started" },
                    { id: "creating-tokens", label: "Creating Tokens" },
                    { id: "claiming-tokens", label: "Claiming Tokens" },
                    { id: "zk-compression", label: "ZK Compression" },
                    { id: "api-reference", label: "API Reference" },
                    { id: "faq", label: "FAQ" }
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-2 px-3 rounded-md transition-colors ${
                        activeSection === item.id
                          ? "bg-purple-900/30 text-white font-medium"
                          : "hover:bg-gray-800/50 text-gray-400 hover:text-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSection(item.id);
                        document.getElementById(item.id)?.scrollIntoView({
                          behavior: "smooth"
                        });
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
              <section id="introduction" className="mb-12">
                <h1 className="text-3xl font-bold mb-6">Introduction to Droploop</h1>
                <p className="text-gray-300 mb-4">
                  Droploop is a platform for creating and distributing compressed tokens on Solana using Zero-Knowledge (ZK) compression technology. This documentation will help you understand how to use Droploop effectively.
                </p>
                <p className="text-gray-300 mb-4">
                  With Droploop, you can create proof-of-participation tokens for events, conferences, online courses, and more at a fraction of the cost of traditional NFTs.
                </p>
                <div className="p-4 bg-purple-900/20 border border-purple-900/50 rounded-lg mt-6">
                  <h3 className="font-medium text-purple-400 mb-2">Why Compressed Tokens?</h3>
                  <p className="text-sm text-gray-300">
                    Compressed tokens reduce on-chain storage requirements by up to 95%, making it cost-effective to distribute tokens to thousands of participants. This is achieved through Solana's state compression using Zero-Knowledge proofs.
                  </p>
                </div>
              </section>

              <section id="getting-started" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                <p className="text-gray-300 mb-4">
                  To get started with Droploop, you'll need a Solana wallet. We recommend using Phantom, Solflare, or any Solana wallet that supports the wallet adapter standard.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Prerequisites</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  <li>A Solana wallet with SOL for transaction fees</li>
                  <li>Basic understanding of web3 concepts</li>
                  <li>For developers: familiarity with React and TypeScript</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Installation</h3>
                <p className="text-gray-300 mb-4">
                  If you're looking to integrate Droploop into your own application, you can install our SDK:
                </p>
                <div className="bg-gray-900 rounded-md p-3 overflow-x-auto mb-4">
                  <pre className="text-gray-300 text-sm"><code>npm install @droploop/sdk</code></pre>
                </div>
              </section>

              <section id="creating-tokens" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Creating Tokens</h2>
                <p className="text-gray-300 mb-4">
                  Creating compressed tokens with Droploop is simple. Navigate to the Create page, connect your wallet, and fill out the form with your event details.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Token Properties</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-700 mt-4">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="px-4 py-2 text-left text-gray-300">Property</th>
                        <th className="px-4 py-2 text-left text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      <tr>
                        <td className="px-4 py-2 text-gray-300">Token Name</td>
                        <td className="px-4 py-2 text-gray-400">The display name of your token</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-300">Token Symbol</td>
                        <td className="px-4 py-2 text-gray-400">A short abbreviation (e.g., "ETH", "BTC")</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-300">Token Description</td>
                        <td className="px-4 py-2 text-gray-400">Details about what the token represents</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-300">Supply</td>
                        <td className="px-4 py-2 text-gray-400">Maximum number of tokens that can be claimed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="claiming-tokens" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Claiming Tokens</h2>
                <p className="text-gray-300 mb-4">
                  Participants can claim tokens by scanning a QR code or visiting a claim link. The process requires connecting a Solana wallet.
                </p>
                
                <div className="relative border border-gray-700 rounded-lg p-6 mt-6">
                  <div className="absolute -top-3 left-4 px-2 bg-black">
                    <span className="text-sm text-gray-400">Claim Flow</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-4 text-gray-300">
                    <li>User scans QR code or visits claim link</li>
                    <li>User connects their Solana wallet</li>
                    <li>System verifies eligibility with Merkle proof</li>
                    <li>User signs transaction to claim token</li>
                    <li>Compressed token is minted directly to user's wallet</li>
                  </ol>
                </div>
              </section>

              <section id="zk-compression" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">ZK Compression</h2>
                <p className="text-gray-300 mb-4">
                  Zero-Knowledge (ZK) compression is a technology that allows for significant reduction in on-chain storage requirements, making token creation and distribution more cost-effective.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">How It Works</h3>
                <p className="text-gray-300 mb-4">
                  Instead of storing all token data on-chain, Droploop uses state compression with Zero-Knowledge proofs:
                </p>
                
                <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                  <li>Token data is hashed into a Merkle tree</li>
                  <li>Only the Merkle root is stored on-chain</li>
                  <li>Token ownership is proven with a Merkle proof</li>
                  <li>ZK proofs verify token data without revealing it</li>
                </ol>
                
                <div className="p-4 bg-purple-900/20 border border-purple-900/50 rounded-lg mt-6">
                  <h3 className="font-medium text-purple-400 mb-2">Cost Savings</h3>
                  <p className="text-sm text-gray-300">
                    Traditional NFTs require ~5kb of on-chain storage per token. Compressed tokens require just ~100 bytes, resulting in up to 98% reduction in storage costs.
                  </p>
                </div>
              </section>

              <section id="api-reference" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">API Reference</h2>
                <p className="text-gray-300 mb-4">
                  Droploop offers a full-featured API for developers who want to integrate compressed token functionality into their applications.
                </p>
                
                <div className="mt-6">
                  <Link href="/api" className="text-purple-400 hover:text-purple-300 underline">
                    View Full API Documentation →
                  </Link>
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">SDK Example</h3>
                <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                  <pre className="text-gray-300 text-sm"><code>{`import { DroploopSDK } from '@droploop/sdk';

// Initialize the SDK
const droploop = new DroploopSDK({
  cluster: 'mainnet-beta',
  wallet: solanaWallet
});

// Create a new token collection
const collectionId = await droploop.createCollection({
  name: 'Conference Attendance',
  symbol: 'CONF',
  description: 'Proof of attendance for DevCon 2025',
  maxSupply: 500
});

// Generate claim link
const claimLink = droploop.generateClaimLink(collectionId);`}</code></pre>
                </div>
              </section>

              <section id="faq" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Are compressed tokens real NFTs?</h3>
                    <p className="text-gray-300">
                      Yes, compressed tokens are real NFTs that use Solana's state compression. They have the same functionality as traditional NFTs but are more cost-effective to create and transfer.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Can I sell compressed tokens?</h3>
                    <p className="text-gray-300">
                      Yes, compressed tokens can be sold and traded on marketplaces that support the cNFT standard on Solana.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">How much does it cost to create tokens?</h3>
                    <p className="text-gray-300">
                      Creating a collection of compressed tokens costs a small amount of SOL for the on-chain storage of the Merkle root. The exact cost depends on the current Solana network fees, but is typically less than 0.01 SOL.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Can I customize the token artwork?</h3>
                    <p className="text-gray-300">
                      Yes, you can upload custom artwork for your tokens. Droploop supports various image formats including PNG, JPG, and SVG.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
