import type { Cluster } from './constants';
import type { PublicKey } from '@solana/web3.js';

export interface ReferralProgramDetails {
  name: string;
  description: string;
  endDate: string; // ISO date string
  website?: string;
  creatorName: string;
  maxReferrals?: number;
}

export interface ReferralTokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  attributes?: TokenAttribute[];
  external_url?: string;
}

export interface TokenAttribute {
  trait_type: string;
  value: string | number;
}

export interface MintFormData {
  programDetails: ReferralProgramDetails;
  tokenMetadata: ReferralTokenMetadata;
  supply: number;
  decimals: number;
}

export interface ProgramDetails {
  name: string;
  description: string;
  endDate: string; // ISO date string
  creatorName: string;
}

export interface RewardDetails {
  amount: number;
  currency: string;
  maxReferrals: number;
}

export interface ReferralProgramData {
  programDetails: ProgramDetails;
  rewardDetails: RewardDetails;
  nftMetadata: ReferralTokenMetadata;
  supply: number;
  decimals: number;
}

export interface ClaimData {
  mint: PublicKey;
  eventId: string;
  claimUrl: string;
  qrCode: string;
}

export interface AppConfig {
  cluster: Cluster;
  rpcEndpoint: string;
  heliusApiKey?: string;
}

export interface UserTokenBalance {
  mint: PublicKey;
  amount: number;
  decimals: number;
  tokenMetadata?: ReferralTokenMetadata;
}
