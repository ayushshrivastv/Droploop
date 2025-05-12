"use client";

import React from 'react';
import { ArticleSection, ArticleParagraph, ArticleHeading, ArticleList, ArticleCallout } from '@/components/ui/article-section';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export const HomeArticleContent: React.FC = () => {
  return (
    <>
      <ArticleSection 
        title="Revolutionizing Referral Programs with ZK Compression" 
        subtitle="How Droploop is making community growth 1000x more efficient on Solana"
      >
        <ArticleParagraph>
          In the rapidly evolving landscape of Web3 communities, effective growth mechanisms are essential. 
          Traditional referral systems face significant challenges: high gas fees, limited scalability, and 
          complex user experiences. Droploop addresses these challenges head-on by leveraging Zero-Knowledge 
          compression technology on Solana.
        </ArticleParagraph>

        <ArticleParagraph>
          Our platform enables creators to launch referral campaigns with minimal cost while maintaining 
          security and transparency. Users can join through personalized QR codes, and both referrers and 
          new participants receive token rewards automatically—all at a fraction of the traditional cost.
        </ArticleParagraph>

        <ArticleHeading>The Problem with Traditional Referral Systems</ArticleHeading>
        
        <ArticleParagraph>
          Web3 projects have long struggled with efficient growth mechanisms. Traditional on-chain referral 
          programs face three critical limitations:
        </ArticleParagraph>

        <ArticleList items={[
          "High costs: Traditional NFTs or tokens on Solana require full on-chain storage, costing approximately 0.01-0.05 SOL per mint.",
          "Limited scalability: As communities grow, transaction fees and storage requirements become prohibitive.",
          "Complex user experience: Many systems require technical knowledge, creating barriers to adoption."
        ]} />

        <ArticleCallout>
          The cost of running a 10,000-participant referral program with traditional methods would be approximately 
          50 SOL. With Droploop's ZK compression, the same program costs just 0.05 SOL—a 1000x reduction.
        </ArticleCallout>

        <ArticleHeading>How ZK Compression Changes Everything</ArticleHeading>
        
        <ArticleParagraph>
          Zero-Knowledge compression is a revolutionary approach to blockchain state management. It utilizes 
          cryptographic proofs to validate data authenticity without revealing the entire dataset, offering 
          significant advantages:
        </ArticleParagraph>

        <ArticleList items={[
          "Cost efficiency: Reduce storage costs by a factor of 1000x, enabling the creation of thousands of referral tokens for fractions of a cent.",
          "Scalability: Handle large-scale referral campaigns with thousands of participants without congesting the blockchain.",
          "Security: Maintain the same security guarantees as traditional on-chain tokens through cryptographic proofs.",
          "Privacy: Keep certain information private while still providing verification of legitimacy.",
          "Performance: Achieve faster transaction finality and a more responsive user experience."
        ]} />

        <ArticleHeading>The Droploop Approach</ArticleHeading>
        
        <ArticleParagraph>
          Droploop implements ZK compression through Light Protocol's SDK, which provides compressed NFT/token 
          creation for referral rewards, Merkle tree management for efficient state verification, and state 
          compression techniques to minimize on-chain footprint.
        </ArticleParagraph>

        <ArticleParagraph>
          Our platform offers two key features that make it perfect for the 1000x Hackathon ZK Compression track:
        </ArticleParagraph>

        <ArticleHeading>QR Code Scanner Integration</ArticleHeading>
        
        <ArticleParagraph>
          We've implemented a fully featured QR scanner that allows users to easily claim tokens by scanning 
          referral codes. The scanner uses the HTML5-QRCode library to access the device camera securely 
          through browser APIs, with robust permission handling and multi-format support for different QR code types.
        </ArticleParagraph>

        <ArticleHeading>Airdrop Mode</ArticleHeading>
        
        <ArticleParagraph>
          In addition to referral-based claiming, we've added a dedicated airdrop mode that allows direct token 
          distribution without requiring referral codes. This provides event organizers with flexibility in how 
          they distribute tokens to participants.
        </ArticleParagraph>

        <ArticleParagraph>
          The UI dynamically adapts based on the active mode, with conditional rendering and transaction logic 
          that adjusts according to whether a user is claiming through a referral or an airdrop.
        </ArticleParagraph>

        <ArticleCallout>
          Droploop represents a significant advancement in community growth mechanisms, making token distribution 
          economically viable at scale while maintaining the security guarantees of blockchain technology.
        </ArticleCallout>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href={`${ROUTES.MINT}?tab=campaign`}>Create Referral</Link>
          </Button>
          <Button asChild variant="outline" className="border-black text-black hover:bg-gray-100">
            <Link href={ROUTES.CLAIM}>Claim Referral</Link>
          </Button>
        </div>
      </ArticleSection>
    </>
  );
};
