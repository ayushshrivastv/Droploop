/**
 * @file standard-token.ts
 * @description Utility functions for creating and managing standard SPL tokens
 * This file provides functions for standard (non-compressed) SPL token operations
 * as a fallback when Light Protocol compressed tokens are not supported by the RPC endpoint
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  ComputeBudgetProgram
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction
} from '@solana/spl-token';
// Note: We're using a simplified approach without Metaplex for metadata
// This avoids the dependency on @metaplex-foundation/mpl-token-metadata

/**
 * Create a standard SPL token mint
 * 
 * @param connection - Solana connection
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mintAuthority - Public key of the account that will have authority to mint tokens
 * @param decimals - Number of decimal places for the token (e.g., 9 for most tokens)
 * @param tokenName - Name of the token (e.g., "Event Name Token")
 * @param tokenSymbol - Symbol of the token (e.g., "POP")
 * @param tokenMetadataUri - URI to the token's metadata JSON (typically hosted on IPFS or Arweave)
 * @returns Object containing the mint public key and transaction signature
 */
export const createStandardTokenMint = async (
  connection: Connection,
  payer: Keypair,
  mintAuthority: PublicKey,
  decimals: number,
  tokenName: string,
  tokenSymbol: string,
  tokenMetadataUri: string
): Promise<{ mint: PublicKey; signature: string }> => {
  console.log('Creating standard SPL token mint...');
  
  // Generate a new keypair for the mint
  const mintKeypair = Keypair.generate();
  
  try {
    // Add priority fee to increase chances of transaction success
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 5000 // Adjust as needed
    });

    // Calculate rent for the mint account
    const mintRent = await getMinimumBalanceForRentExemptMint(
      connection
    );

    // Create a transaction to create the mint account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID
    });

    // Initialize the mint account
    const initializeMintInstruction = createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      mintAuthority,
      mintAuthority, // Freeze authority (same as mint authority in this case)
      TOKEN_PROGRAM_ID
    );

    // Note: We're skipping metadata creation to avoid dependency on Metaplex
    // In a production environment, you would want to add metadata
    // This simplified version just creates a basic SPL token without metadata

    // Create the transaction
    const transaction = new Transaction().add(
      priorityFeeInstruction,
      createAccountInstruction,
      initializeMintInstruction
      // Metadata instruction removed to avoid dependency issues
    );

    // Implement retry mechanism for transaction sending
    let retries = 3;
    let signature;
    
    while (retries > 0) {
      try {
        // Send and confirm the transaction
        signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [payer, mintKeypair],
          { commitment: 'confirmed' }
        );
        console.log('Create standard token mint transaction successful, signature:', signature);
        break;
      } catch (error) {
        retries--;
        console.error(`Error creating standard token mint (${retries} retries left):`, error);
        
        if (retries === 0) throw error;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      mint: mintKeypair.publicKey,
      signature: signature!,
    };
  } catch (error) {
    console.error('Error creating standard token mint:', error);
    throw error;
  }
};

/**
 * Mint standard SPL tokens to a destination account
 * 
 * @param connection - Solana connection
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mint - Public key of the token mint
 * @param destination - Public key of the destination account
 * @param authority - Keypair with authority to mint tokens
 * @param amount - Amount of tokens to mint (in base units)
 * @returns Object containing the transaction signature
 */
export const mintStandardTokens = async (
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  destination: PublicKey,
  authority: Keypair,
  amount: number
): Promise<{ signature: string }> => {
  console.log(`Minting ${amount} standard SPL tokens to ${destination.toBase58()}...`);
  
  try {
    // Add priority fee to increase chances of transaction success
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 5000 // Adjust as needed
    });

    // Get or create the associated token account for the destination
    const destinationTokenAccount = await getAssociatedTokenAddress(
      mint,
      destination,
      false
    );

    // Check if the token account exists
    const tokenAccountInfo = await connection.getAccountInfo(destinationTokenAccount);
    
    // Create a transaction
    const transaction = new Transaction().add(priorityFeeInstruction);
    
    // If the token account doesn't exist, add an instruction to create it
    if (!tokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          destinationTokenAccount,
          destination,
          mint
        )
      );
    }
    
    // Add instruction to mint tokens
    transaction.add(
      createMintToInstruction(
        mint,
        destinationTokenAccount,
        authority.publicKey,
        amount
      )
    );

    // Implement retry mechanism for transaction sending
    let retries = 3;
    let signature;
    
    while (retries > 0) {
      try {
        // Send and confirm the transaction
        signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [payer, authority],
          { commitment: 'confirmed' }
        );
        console.log('Mint standard tokens transaction successful, signature:', signature);
        break;
      } catch (error) {
        retries--;
        console.error(`Error minting standard tokens (${retries} retries left):`, error);
        
        if (retries === 0) throw error;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { signature: signature! };
  } catch (error) {
    console.error('Error minting standard tokens:', error);
    throw error;
  }
};

/**
 * Format a public key for display with ellipsis in the middle
 * 
 * @param publicKey - Solana public key or base58 string to format
 * @param length - Number of characters to show at beginning and end (default: 4)
 * @returns Formatted string with beginning and end of the key with ellipsis in between
 */
export const formatPublicKey = (publicKey: PublicKey | string, length = 4): string => {
  const key = typeof publicKey === 'string' ? publicKey : publicKey.toBase58();
  return `${key.slice(0, length)}...${key.slice(-length)}`;
};

/**
 * Format token amount with proper decimal places for display
 * 
 * @param amount - Raw token amount in base units (e.g., lamports for SOL)
 * @param decimals - Number of decimal places the token uses
 * @returns Formatted string with proper decimal representation and thousands separators
 */
export const formatTokenAmount = (amount: number, decimals: number): string => {
  return (amount / (10 ** decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
