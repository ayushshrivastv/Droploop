export const APP_NAME = "Droploop: Decentralized Referral System";
export const APP_DESCRIPTION = "A decentralized referral system on Solana using ZK Compression with Light Protocol for community growth";

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

// Token metadata defaults
export const DEFAULT_METADATA = {
  name: "Droploop Referral Token",
  symbol: "DROP",
  description: "This token rewards you for participating in the Droploop referral program",
  image: "https://example.com/droploop-token.png",
};

// Routes
export const ROUTES = {
  HOME: "/",
  MINT: "/mint",
  CLAIM: "/claim",
  PROFILE: "/profile",
};
