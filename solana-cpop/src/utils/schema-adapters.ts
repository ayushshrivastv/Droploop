// Schema adapter utilities to convert between camelCase and snake_case
// for database operations

// Event adapter functions
export interface EventInput {
  creatorId: string;
  creatorWallet: string;
  eventName: string;
  tokenName: string;
  tokenSymbol: string;
  maxSupply: number;
  isActive?: boolean;
  eventUri: string;
  tokenUri: string;
  merkleRoot?: string;
  merkleTreeAddress?: string;
  onChainInitialized?: boolean;
  lastTransactionSignature?: string;
  claimedCount?: number;
}

export interface EventDbFields {
  creator_id: string;
  creator_wallet: string;
  event_name: string;
  token_name: string;
  token_symbol: string;
  max_supply: number;
  is_active?: boolean;
  event_uri: string;
  token_uri: string;
  merkle_root?: string;
  merkle_tree_address?: string;
  on_chain_initialized?: boolean;
  last_transaction_signature?: string;
  claimed_count?: number;
}

// QR Code adapter functions
export interface QrCodeInput {
  eventId: string;
  qrCodeId: string;
  secretKey: string;
  expirationTime: number;
  isUsed?: boolean;
  claimedBy?: string;
  claimedAt?: Date;
}

export interface QrCodeDbFields {
  event_id: string;
  qr_code_id: string;
  secret_key: string;
  expiration_time: number;
  is_used?: boolean;
  claimed_by?: string;
  claimed_at?: Date;
}

// Convert from TypeScript camelCase to database snake_case for Events
export function eventToDbFields(input: Partial<EventInput>): Partial<EventDbFields> {
  const result: Partial<EventDbFields> = {};
  
  if (input.creatorId !== undefined) result.creator_id = input.creatorId;
  if (input.creatorWallet !== undefined) result.creator_wallet = input.creatorWallet;
  if (input.eventName !== undefined) result.event_name = input.eventName;
  if (input.tokenName !== undefined) result.token_name = input.tokenName;
  if (input.tokenSymbol !== undefined) result.token_symbol = input.tokenSymbol;
  if (input.maxSupply !== undefined) result.max_supply = input.maxSupply;
  if (input.isActive !== undefined) result.is_active = input.isActive;
  if (input.eventUri !== undefined) result.event_uri = input.eventUri;
  if (input.tokenUri !== undefined) result.token_uri = input.tokenUri;
  if (input.merkleRoot !== undefined) result.merkle_root = input.merkleRoot;
  if (input.merkleTreeAddress !== undefined) result.merkle_tree_address = input.merkleTreeAddress;
  if (input.onChainInitialized !== undefined) result.on_chain_initialized = input.onChainInitialized;
  if (input.lastTransactionSignature !== undefined) result.last_transaction_signature = input.lastTransactionSignature;
  if (input.claimedCount !== undefined) result.claimed_count = input.claimedCount;
  
  return result;
}

// Convert from database snake_case to TypeScript camelCase for Events
export function dbFieldsToEvent(input: Partial<EventDbFields>): Partial<EventInput> {
  const result: Partial<EventInput> = {};
  
  if (input.creator_id !== undefined) result.creatorId = input.creator_id;
  if (input.creator_wallet !== undefined) result.creatorWallet = input.creator_wallet;
  if (input.event_name !== undefined) result.eventName = input.event_name;
  if (input.token_name !== undefined) result.tokenName = input.token_name;
  if (input.token_symbol !== undefined) result.tokenSymbol = input.token_symbol;
  if (input.max_supply !== undefined) result.maxSupply = input.max_supply;
  if (input.is_active !== undefined) result.isActive = input.is_active;
  if (input.event_uri !== undefined) result.eventUri = input.event_uri;
  if (input.token_uri !== undefined) result.tokenUri = input.token_uri;
  if (input.merkle_root !== undefined) result.merkleRoot = input.merkle_root;
  if (input.merkle_tree_address !== undefined) result.merkleTreeAddress = input.merkle_tree_address;
  if (input.on_chain_initialized !== undefined) result.onChainInitialized = input.on_chain_initialized;
  if (input.last_transaction_signature !== undefined) result.lastTransactionSignature = input.last_transaction_signature;
  if (input.claimed_count !== undefined) result.claimedCount = input.claimed_count;
  
  return result;
}

// Convert from TypeScript camelCase to database snake_case for QR Codes
export function qrCodeToDbFields(input: Partial<QrCodeInput>): Partial<QrCodeDbFields> {
  const result: Partial<QrCodeDbFields> = {};
  
  if (input.eventId !== undefined) result.event_id = input.eventId;
  if (input.qrCodeId !== undefined) result.qr_code_id = input.qrCodeId;
  if (input.secretKey !== undefined) result.secret_key = input.secretKey;
  if (input.expirationTime !== undefined) result.expiration_time = input.expirationTime;
  if (input.isUsed !== undefined) result.is_used = input.isUsed;
  if (input.claimedBy !== undefined) result.claimed_by = input.claimedBy;
  if (input.claimedAt !== undefined) result.claimed_at = input.claimedAt;
  
  return result;
}

// Convert from database snake_case to TypeScript camelCase for QR Codes
export function dbFieldsToQrCode(input: Partial<QrCodeDbFields>): Partial<QrCodeInput> {
  const result: Partial<QrCodeInput> = {};
  
  if (input.event_id !== undefined) result.eventId = input.event_id;
  if (input.qr_code_id !== undefined) result.qrCodeId = input.qr_code_id;
  if (input.secret_key !== undefined) result.secretKey = input.secret_key;
  if (input.expiration_time !== undefined) result.expirationTime = input.expiration_time;
  if (input.is_used !== undefined) result.isUsed = input.is_used;
  if (input.claimed_by !== undefined) result.claimedBy = input.claimed_by;
  if (input.claimed_at !== undefined) result.claimedAt = input.claimed_at;
  
  return result;
}
