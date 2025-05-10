import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import type { AccountMeta } from '@solana/web3.js';
// Define wallet interface
interface SolanaWallet {
  publicKey: PublicKey;
  signTransaction?: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>;
  // Add any other methods your wallet might have
}

// Custom AnchorProvider implementation to avoid dependency issues
class CustomAnchorProvider {
  wallet: SolanaWallet;
  connection: Connection;
  
  constructor(connection: Connection, wallet: SolanaWallet, options: { commitment: string }) {
    this.connection = connection;
    this.wallet = wallet;
  }
  
  async sendAndConfirm(tx: Transaction, signers: Keypair[] = []): Promise<string> {
    if (signers.length > 0) {
      tx.sign(...signers);
    }
    
    if (this.wallet.signTransaction) {
      tx = await this.wallet.signTransaction(tx);
    }
    
    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      signers,
      { commitment: 'confirmed' }
    );
    
    return signature;
  }
}
import { PoseidonHasher } from './merkle-tree';
import { calculateMerkleTreeSpace } from './merkle-tree-util';

// Constants for the SPL Account Compression program
export const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey('cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK');
export const SPL_NOOP_PROGRAM_ID = new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV');

// Use this when no local connection is available
const getConnection = () => new Connection('https://api.devnet.solana.com', 'confirmed');

// Constants for the Merkle tree
const MERKLE_TREE_HEIGHT = 20;
const MERKLE_TREE_BUFFER_SIZE = 64;
const CANOPY_DEPTH = 0;

// cPOP Program ID from your Anchor.toml or lib.rs
const CPOP_PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// Create a Merkle tree account for an event
export async function createMerkleTreeAccount(
  wallet: any,
  payer: Keypair | null = null
): Promise<Keypair> {
  const connection = getConnection();
  const provider = new CustomAnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  // If no separate payer is provided, use the wallet
  if (!payer) {
    // We need to create a temporary keypair to sign the transaction
    // because we can't extract the private key from the wallet adapter
    const tempPayer = Keypair.generate(); 
    
    // Transfer some SOL to the temporary payer
    const transferIx = SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: tempPayer.publicKey,
      lamports: 100000000, // 0.1 SOL
    });
    
    const transferTx = new Transaction().add(transferIx);
    await provider.sendAndConfirm(transferTx);
    
    payer = tempPayer;
  }
  
  // Generate new keypair for the Merkle tree
  const treeKeypair = Keypair.generate();
  
  // Calculate required space for Merkle tree
  // This is an estimation based on SPL Account Compression program requirements
  // In a production environment, use the actual getConcurrentMerkleTreeAccountSize function
  const space = calculateMerkleTreeSpace(
    MERKLE_TREE_HEIGHT, 
    MERKLE_TREE_BUFFER_SIZE,
    CANOPY_DEPTH
  );
  
  // Calculate minimum balance for rent exemption
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
  // Create transaction to allocate space
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: treeKeypair.publicKey,
    lamports,
    space,
    programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  });
  
  // Send and confirm transaction
  const tx = new Transaction().add(createAccountIx);
  await sendAndConfirmTransaction(
    connection,
    tx,
    [payer, treeKeypair],
    { commitment: 'confirmed' }
  );
  
  console.log('Merkle tree account created:', treeKeypair.publicKey.toString());
  return treeKeypair;
}

// Helper function to create a hash from TokenData (matching on-chain implementation)
export function createLeafHash(
  event: PublicKey,
  claimer: PublicKey,
  tokenId: number,
  claimTime: number
): Uint8Array {
  // Create a hasher using Poseidon
  const hasher = new PoseidonHasher();
  
  // Serialize all fields into a byte array (matching on-chain order)
  const eventBytes = event.toBytes();
  const claimerBytes = claimer.toBytes();
  const tokenIdBytes = new Uint8Array(8);
  const claimTimeBytes = new Uint8Array(8);
  
  // Convert to little-endian bytes
  const tokenIdView = new DataView(tokenIdBytes.buffer);
  const claimTimeView = new DataView(claimTimeBytes.buffer);
  
  // Handle BigInt for different browser environments
  try {
    tokenIdView.setBigUint64(0, BigInt(tokenId), true);
    claimTimeView.setBigUint64(0, BigInt(claimTime), true);
  } catch (e) {
    // Fallback for environments without BigInt support
    const buf1 = Buffer.alloc(8);
    const buf2 = Buffer.alloc(8);
    buf1.writeBigUInt64LE(BigInt(tokenId));
    buf2.writeBigUInt64LE(BigInt(claimTime));
    tokenIdBytes.set(buf1);
    claimTimeBytes.set(buf2);
  }
  
  // Concatenate all bytes
  const allBytes = new Uint8Array(eventBytes.length + claimerBytes.length + tokenIdBytes.length + claimTimeBytes.length);
  allBytes.set(eventBytes, 0);
  allBytes.set(claimerBytes, eventBytes.length);
  allBytes.set(tokenIdBytes, eventBytes.length + claimerBytes.length);
  allBytes.set(claimTimeBytes, eventBytes.length + claimerBytes.length + tokenIdBytes.length);
  
  // Hash and return
  return hasher.hash(allBytes);
}

// Initialize a new event with a Merkle tree
export async function initializeEvent(
  wallet: any,
  merkleTreeKeypair: Keypair,
  eventName: string,
  tokenName: string,
  tokenSymbol: string,
  maxSupply: number,
  eventUri: string,
  tokenUri: string
): Promise<{ 
  txSignature: string; 
  eventPDA: PublicKey;
}> {
  const connection = getConnection();
  const provider = new CustomAnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  // Calculate Event PDA
  const [eventPDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('event'),
      provider.wallet.publicKey.toBuffer(),
      Buffer.from(eventName)
    ],
    CPOP_PROGRAM_ID
  );
  
  // Build the transaction manually since we're not using the Anchor client directly
  const initializeEventIx = new TransactionInstruction({
    programId: CPOP_PROGRAM_ID,
    keys: [
      // These match the accounts expected by InitializeEvent in the program
      { pubkey: eventPDA, isSigner: false, isWritable: true },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: merkleTreeKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SPL_NOOP_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      /* 
       * This would be the serialized instruction data for initializeEvent 
       * In a production app, you would use proper serialization from Anchor
       * For now, we're just showing the structure
       */
    ]),
  });
  
  // Create and send transaction
  const tx = new Transaction().add(initializeEventIx);
  const txSignature = await provider.sendAndConfirm(tx);
  
  return { 
    txSignature, 
    eventPDA 
  };
}

// Claim a token by adding a leaf to the Merkle tree
export async function claimToken(
  wallet: any,
  eventPDA: PublicKey,
  merkleTreeAddress: PublicKey,
  eventCreatorAddress: PublicKey,
  qrCodeId: string,
  secretKey: Uint8Array
): Promise<string> {
  const connection = getConnection();
  const provider = new CustomAnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  // Calculate QR Code PDA
  const [qrCodePDA] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('qr_code'),
      eventPDA.toBuffer(),
      Buffer.from(qrCodeId)
    ],
    CPOP_PROGRAM_ID
  );
  
  // Build the transaction for claiming a token
  const claimTokenIx = new TransactionInstruction({
    programId: CPOP_PROGRAM_ID,
    keys: [
      { pubkey: qrCodePDA, isSigner: false, isWritable: true },
      { pubkey: eventPDA, isSigner: false, isWritable: true },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: merkleTreeAddress, isSigner: false, isWritable: true },
      { pubkey: eventCreatorAddress, isSigner: false, isWritable: false },
      { pubkey: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SPL_NOOP_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      /* 
       * Serialized instruction data for claimToken 
       * In production, this would include qrCodeId and secretKey properly encoded
       */
    ]),
  });
  
  // Create and send transaction
  const tx = new Transaction().add(claimTokenIx);
  return await provider.sendAndConfirm(tx);
}

// Verify token ownership using a Merkle proof
export async function verifyToken(
  wallet: any,
  eventPDA: PublicKey,
  merkleTreeAddress: PublicKey,
  tokenId: number,
  leafHash: Uint8Array,
  merkleProof: Uint8Array[]
): Promise<boolean> {
  const connection = getConnection();
  const provider = new CustomAnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  // Build the transaction for verifying a token
  const verifyTokenIx = new TransactionInstruction({
    programId: CPOP_PROGRAM_ID,
    keys: [
      { pubkey: eventPDA, isSigner: false, isWritable: false },
      { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: merkleTreeAddress, isSigner: false, isWritable: false },
      { pubkey: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SPL_NOOP_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      /* 
       * Serialized instruction data for verifyToken
       * This would include tokenId, leafHash, and merkleProof properly encoded
       */
    ]),
  });
  
  try {
    // Create and send transaction
    const tx = new Transaction().add(verifyTokenIx);
    await provider.sendAndConfirm(tx);
    return true; // If we get here, verification succeeded
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}
