export const APP_NAME = "Droploop Referral System";
export const APP_DESCRIPTION = "Decentralized referral system built on Solana blockchain using Light Protocol's compression technology.";

// RPC endpoints - Replace with your actual endpoints when deploying
export const DEVNET_RPC_ENDPOINT = "https://api.devnet.solana.com";
export const MAINNET_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// Helius endpoint (requires API key)
export const HELIUS_RPC_ENDPOINT = (apiKey: string) => `https://devnet.helius-rpc.com/?api-key=${apiKey}`;

// Cluster
export type Cluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";
export const DEFAULT_CLUSTER: Cluster = "devnet";

// Default token decimals
export const DEFAULT_TOKEN_DECIMALS = 9;

// Referral token metadata defaults
export const DEFAULT_METADATA = {
  name: "Droploop Referral Reward",
  symbol: "DRR",
  description: "This token represents a referral reward in the Droploop system",
  image: "https://example.com/placeholder.png",
};

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  MINT: "/create-program",
  CLAIM: "/claim-reward",
  PROFILE: "/profile",
  ADMIN: "/admin",
  CREATE_PROGRAM: "/create-program",
  DOCUMENTATION: "/docs",
};
