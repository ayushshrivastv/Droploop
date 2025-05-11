// Type definitions for the application
import { PublicKey } from '@solana/web3.js';

// Token type representing a claimed proof-of-participation token
export interface Token {
  id: string;
  eventName: string;
  tokenName: string;
  tokenSymbol: string;
  claimedAt: number;
  tokenUri: string;
  imageUrl?: string;
}

// Event/Campaign type
export interface Campaign {
  id: string;
  creatorId: string;
  creatorWallet: string;
  eventName: string;
  tokenName: string;
  tokenSymbol: string;
  description?: string | null;
  maxSupply: number;
  claimedCount: number;
  merkleTreeAddress: string;
  eventPda: string;
  transactionSignature: string;
  eventUri: string;
  tokenUri: string;
  createdAt: Date;
  updatedAt: Date;
}

// QR Code / Referral Link type
export interface ReferralLink {
  id: string;
  createdAt: Date;
  eventId: string;
  qrCodeId: string;
  secretKey: string;
  expirationTime: number;
  isUsed: boolean;
  claimedBy: string | null;
  claimedAt: Date | null;
  qrCodeData: string;
}

// New campaign data type
export interface NewCampaignData {
  campaignName: string;
  rewardName: string;
  rewardSymbol: string;
  maxReferrals: number;
  campaignUri: string;
  rewardUri: string;
}

// Token claim result
export interface TokenClaimResult {
  success: boolean;
  transactionSignature: string;
  eventName?: string;
  tokenName?: string;
  tokenSymbol?: string;
  claimed?: boolean;
  campaignId?: string;
  rewardName?: string;
}

// Campaign creation result
export interface CampaignCreationResult {
  success: boolean;
  campaignId: string;
  merkleTreeAddress: string;
  eventPDA: string;
  txSignature: string;
}

// Referral link generation result
export interface ReferralLinkResult {
  success: boolean;
  qrCode?: ReferralLink;
  message?: string;
  referralId?: string;
  qrCodeId?: string;
  secretKey?: string;
  referralUrl?: string;
  expirationTime?: number;
}
