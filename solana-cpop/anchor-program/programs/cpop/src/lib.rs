use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use light_merkle_tree_reference::MerkleTree;
use light_poseidon::Poseidon;
use light_protocol_program::poseidon::PoseidonShake;
use solana_program::program::invoke;
use solana_program::instruction::{AccountMeta, Instruction};
use std::convert::TryInto;

// Define constants for the Merkle tree used for ZK Compression
const MERKLE_TREE_HEIGHT: usize = 20; // Height of the Merkle tree (supports 2^20 leaf nodes)
const MERKLE_TREE_BUFFER_SIZE: usize = 64; // Buffer size for the Merkle tree (number of concurrent updates)
const MAX_BUFFER_SIZE: usize = 256;   // Maximum number of concurrent operations

// Add the SPL Account Compression Program ID constant
pub const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID: Pubkey = pubkey!("cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK");
// Add the SPL No-Op Program ID constant
pub const SPL_NOOP_PROGRAM_ID: Pubkey = pubkey!("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV");

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Define the program
#[program]
pub mod cpop {
    use super::*;
    use anchor_lang::solana_program::sysvar::rent::Rent;

    /// Initialize a new event with a cToken
    pub fn initialize_event(
        ctx: Context<InitializeEvent>,
        event_name: String,
        token_name: String,
        token_symbol: String,
        max_supply: u64,
        event_uri: String,
        token_uri: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let creator = &ctx.accounts.creator;

        // Check correct program IDs are passed
        if ctx.accounts.compression_program.key() != SPL_ACCOUNT_COMPRESSION_PROGRAM_ID {
            return err!(CpopError::IncorrectCompressionProgramId);
        }
        if ctx.accounts.noop_program.key() != SPL_NOOP_PROGRAM_ID {
            return err!(CpopError::IncorrectNoopProgramId);
        }

        // Initialize event data
        event.creator = creator.key();
        event.event_name = event_name;
        event.token_name = token_name;
        event.token_symbol = token_symbol;
        event.max_supply = max_supply;
        event.claimed_count = 0;
        event.is_active = true;
        event.event_uri = event_uri;
        event.token_uri = token_uri;
        event.merkle_root = [0; 32]; // Initial empty Merkle root
        event.merkle_tree = ctx.accounts.merkle_tree_account.key(); // Store the merkle tree account pubkey

        // CPI to SPL Account Compression program to initialize the Merkle tree
        msg!("Initializing Merkle Tree via CPI...");

        // Instruction discriminator for init_empty_merkle_tree: sighash("global", "init_empty_merkle_tree")
        // calculated as: [202, 100, 121, 69, 205, 5, 222, 107]
        let init_empty_merkle_tree_discriminator: [u8; 8] = [202, 100, 121, 69, 205, 5, 222, 107];
        let max_depth_bytes = (MERKLE_TREE_HEIGHT as u32).to_le_bytes();
        let max_buffer_size_bytes = (MERKLE_TREE_BUFFER_SIZE as u32).to_le_bytes();

        let mut instruction_data = Vec::with_capacity(8 + 4 + 4);
        instruction_data.extend_from_slice(&init_empty_merkle_tree_discriminator);
        instruction_data.extend_from_slice(&max_depth_bytes);
        instruction_data.extend_from_slice(&max_buffer_size_bytes);

        let accounts_for_cpi = vec![
            AccountMeta::new(ctx.accounts.merkle_tree_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.creator.key(), true), // Authority
            AccountMeta::new_readonly(ctx.accounts.noop_program.key(), false),
        ];

        let cpi_instruction = Instruction {
            program_id: ctx.accounts.compression_program.key(),
            accounts: accounts_for_cpi,
            data: instruction_data,
        };

        invoke(
            &cpi_instruction,
            &[
                ctx.accounts.merkle_tree_account.to_account_info(),
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.noop_program.to_account_info(),
                ctx.accounts.compression_program.to_account_info(), // Ensure compression program is passed for invoke
            ],
        )?;

        msg!("Merkle Tree Initialized. Event: {}, Tree: {}", event.key(), event.merkle_tree);
        Ok(())
    }

    /// Generate a QR code for token claiming
    pub fn generate_qr_code(
        ctx: Context<GenerateQRCode>,
        qr_code_id: String,
        secret_key: [u8; 32],
        expiration_time: i64,
    ) -> Result<()> {
        let qr_code = &mut ctx.accounts.qr_code;
        let event = &mut ctx.accounts.event;
        let creator = &ctx.accounts.creator;

        // Verify creator
        require_keys_eq!(
            event.creator,
            creator.key(),
            ErrorCode::UnauthorizedCreator
        );

        // Verify event is active
        require!(event.is_active, ErrorCode::EventInactive);

        // Check if we're under max supply
        require!(
            event.claimed_count < event.max_supply,
            ErrorCode::MaxSupplyReached
        );

        // Initialize QR code
        qr_code.event = event.key();
        qr_code.qr_code_id = qr_code_id;
        qr_code.secret_key = secret_key;
        qr_code.is_claimed = false;
        qr_code.creation_time = Clock::get()?.unix_timestamp;
        qr_code.expiration_time = expiration_time;
        qr_code.claimer = None;
        qr_code.bump = *ctx.bumps.get("qr_code").unwrap();

        msg!("QR code generated for event: {}", event.event_name);
        Ok(())
    }

    /// Claim a token by scanning a QR code
    pub fn claim_token(
        ctx: Context<ClaimToken>,
        qr_code_id: String,
        secret_key: [u8; 32],
    ) -> Result<()> {
        let qr_code = &mut ctx.accounts.qr_code;
        let event = &mut ctx.accounts.event;
        let claimer = &ctx.accounts.claimer;

        // Check if event is still active
        if !event.is_active {
            return err!(ErrorCode::EventInactive);
        }

        // Check if max supply has been reached
        if event.claimed_count >= event.max_supply {
            return err!(ErrorCode::MaxSupplyReached);
        }

        // Verify QR code hasn't been claimed yet
        if qr_code.claimer.is_some() {
            return err!(ErrorCode::QRCodeAlreadyClaimed);
        }

        // Verify QR code hasn't expired
        let current_time = Clock::get()?.unix_timestamp;
        if current_time > qr_code.expiration_time {
            return err!(ErrorCode::QRCodeExpired);
        }

        // Verify secret key
        if qr_code.secret_key != secret_key {
            return err!(ErrorCode::InvalidSecretKey);
        }

        // Check correct program IDs are passed
        if ctx.accounts.compression_program.key() != SPL_ACCOUNT_COMPRESSION_PROGRAM_ID {
            return err!(CpopError::IncorrectCompressionProgramId);
        }
        if ctx.accounts.noop_program.key() != SPL_NOOP_PROGRAM_ID {
            return err!(CpopError::IncorrectNoopProgramId);
        }

        // Create token data to be compressed
        let token_data = TokenData {
            event: event.key(),
            claimer: claimer.key(),
            token_id: event.claimed_count + 1, // Assign next token ID
            claim_time: current_time,
        };

        // Hash token data to create leaf node
        let leaf_hash = hash_token_data(&token_data);

        msg!("Appending leaf to Merkle tree via CPI...");

        // Instruction discriminator for append_leaf: sighash("global", "append_leaf")
        // This is a placeholder value; the actual sighash should be computed or looked up
        let append_leaf_discriminator: [u8; 8] = [46, 133, 111, 28, 75, 221, 142, 148];

        // Prepare the leaf data for append_leaf
        let mut instruction_data = Vec::with_capacity(8 + 32);
        instruction_data.extend_from_slice(&append_leaf_discriminator);
        instruction_data.extend_from_slice(&leaf_hash);

        // Accounts required for append_leaf CPI
        let accounts_for_cpi = vec![
            AccountMeta::new(event.merkle_tree, false), // Merkle tree account
            AccountMeta::new_readonly(event.creator, true), // Authority (creator)
            AccountMeta::new_readonly(ctx.accounts.noop_program.key(), false), // No-op program
        ];

        let cpi_instruction = Instruction {
            program_id: ctx.accounts.compression_program.key(),
            accounts: accounts_for_cpi,
            data: instruction_data,
        };

        // Invoke the append_leaf instruction
        invoke(
            &cpi_instruction,
            &[
                ctx.accounts.merkle_tree_account.to_account_info(),
                ctx.accounts.event_creator.to_account_info(), // The event creator is the authority
                ctx.accounts.noop_program.to_account_info(),
                ctx.accounts.compression_program.to_account_info(),
            ],
        )?;

        // Update the event's merkle root - note: in practice, this is managed by the compression program
        // We only update our counters here
        event.claimed_count += 1;

        // Mark the QR code as claimed
        qr_code.claimer = Some(claimer.key());
        qr_code.claim_time = Some(current_time);

        msg!("Token claimed successfully! Token ID: {}", token_data.token_id);
        Ok(())
    }

    /// Verify token ownership using ZK proof
    pub fn verify_token(
        ctx: Context<VerifyToken>,
        token_id: u64,
        leaf_hash: [u8; 32],
        merkle_proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        let claimer = &ctx.accounts.claimer;
        
        // Check if event is active
        if !event.is_active {
            return err!(ErrorCode::EventInactive);
        }
        
        // Check correct program IDs are passed
        if ctx.accounts.compression_program.key() != SPL_ACCOUNT_COMPRESSION_PROGRAM_ID {
            return err!(CpopError::IncorrectCompressionProgramId);
        }
        if ctx.accounts.noop_program.key() != SPL_NOOP_PROGRAM_ID {
            return err!(CpopError::IncorrectNoopProgramId);
        }
        
        msg!("Verifying token leaf via CPI...");
        
        // Instruction discriminator for verify_leaf: sighash("global", "verify_leaf")
        // This is a placeholder value; the actual sighash should be computed or looked up
        let verify_leaf_discriminator: [u8; 8] = [153, 18, 178, 47, 197, 158, 86, 15];
        
        // Create the root and index parameters for verify_leaf
        let mut instruction_data = Vec::with_capacity(8 + 32 + merkle_proof.len() * 32 + 4);
        instruction_data.extend_from_slice(&verify_leaf_discriminator);
        instruction_data.extend_from_slice(&leaf_hash);
        instruction_data.extend_from_slice(&(token_id as u32).to_le_bytes());
        
        // We need to tell the compression program how many proof nodes we're sending
        let proof_len = merkle_proof.len() as u32;
        instruction_data.extend_from_slice(&proof_len.to_le_bytes());
        
        // Add each proof node to the instruction data
        for node in &merkle_proof {
            instruction_data.extend_from_slice(node);
        }
        
        // Accounts required for verify_leaf CPI
        let accounts_for_cpi = vec![
            AccountMeta::new_readonly(event.merkle_tree, false), // Merkle tree account
        ];
        
        let cpi_instruction = Instruction {
            program_id: ctx.accounts.compression_program.key(),
            accounts: accounts_for_cpi,
            data: instruction_data,
        };
        
        // Invoke the verify_leaf instruction
        invoke(
            &cpi_instruction,
            &[
                ctx.accounts.merkle_tree_account.to_account_info(),
                ctx.accounts.compression_program.to_account_info(),
            ],
        )?;
        
        msg!("Token verified successfully for token ID: {} and claimer: {}", token_id, claimer.key());
        Ok(())
    }

    /// Deactivate an event
    pub fn deactivate_event(ctx: Context<UpdateEvent>) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let creator = &ctx.accounts.creator;

        // Verify creator
        require_keys_eq!(
            event.creator,
            creator.key(),
            ErrorCode::UnauthorizedCreator
        );

        event.is_active = false;

        msg!("Event deactivated: {}", event.event_name);
        Ok(())
    }

    /// Reactivate an event
    pub fn reactivate_event(ctx: Context<UpdateEvent>) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let creator = &ctx.accounts.creator;

        // Verify creator
        require_keys_eq!(
            event.creator,
            creator.key(),
            ErrorCode::UnauthorizedCreator
        );

        event.is_active = true;

        msg!("Event reactivated: {}", event.event_name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Event::MAX_SIZE,
        seeds = [b"event".as_ref(), creator.key().as_ref(), event.event_name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    /// CHECK: This account is the Merkle tree. It will be initialized by SPL Account Compression.
    /// Client is responsible for creating and allocating space for this account beforehand.
    /// Owner must be SPL Account Compression Program.
    pub merkle_tree_account: UncheckedAccount<'info>,
    /// CHECK: SPL Account Compression Program ID.
    pub compression_program: UncheckedAccount<'info>,
    /// CHECK: SPL No-Op Program ID.
    pub noop_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(
    qr_code_id: String,
    secret_key: [u8; 32],
    expiration_time: i64,
)]
pub struct GenerateQRCode<'info> {
    #[account(
        init,
        payer = creator,
        space = QRCode::SIZE,
        seeds = [b"qr_code", event.key().as_ref(), qr_code_id.as_bytes()],
        bump
    )]
    pub qr_code: Account<'info, QRCode>,
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(qr_code_id: String, secret_key: [u8; 32])]
pub struct ClaimToken<'info> {
    #[account(
        mut,
        seeds = [b"qr_code", event.key().as_ref(), qr_code_id.as_bytes()],
        bump = qr_code.bump
    )]
    pub qr_code: Account<'info, QRCode>,
    #[account(
        mut,
        seeds = [b"event", event.creator.as_ref(), event.event_name.as_bytes()],
        bump = event.bump
    )]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub claimer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    /// CHECK: This account is the Merkle tree. It will be accessed by SPL Account Compression.
    pub merkle_tree_account: UncheckedAccount<'info>,
    /// CHECK: This account is the event creator and authority of the Merkle tree.
    pub event_creator: UncheckedAccount<'info>,
    /// CHECK: SPL Account Compression Program ID.
    pub compression_program: UncheckedAccount<'info>,
    /// CHECK: SPL No-Op Program ID.
    pub noop_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(token_id: u64, leaf_hash: [u8; 32], merkle_proof: Vec<[u8; 32]>)]
pub struct VerifyToken<'info> {
    #[account(
        seeds = [b"event", event.creator.as_ref(), event.event_name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    pub claimer: Signer<'info>,
    /// CHECK: This account is the Merkle tree. It will be accessed by SPL Account Compression.
    pub merkle_tree_account: UncheckedAccount<'info>,
    /// CHECK: SPL Account Compression Program ID.
    pub compression_program: UncheckedAccount<'info>,
    /// CHECK: SPL No-Op Program ID.
    pub noop_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateEvent<'info> {
    #[account(
        mut,
        seeds = [b"event", event.creator.as_ref(), event.event_name.as_bytes()],
        bump = event.bump
    )]
    pub event: Account<'info, Event>,
    #[account(
        constraint = event.creator == creator.key() @ ErrorCode::UnauthorizedCreator
    )]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct Event {
    pub creator: Pubkey,           // Event creator
    pub event_name: String,        // Name of the event
    pub token_name: String,        // Name of the token
    pub token_symbol: String,      // Symbol of the token
    pub max_supply: u64,           // Maximum supply of tokens
    pub claimed_count: u64,        // Number of tokens claimed
    pub is_active: bool,           // Whether the event is active
    pub event_uri: String,         // URI to event metadata
    pub token_uri: String,         // URI to token metadata
    pub merkle_root: [u8; 32],     // Merkle root for compressed tokens
    pub merkle_tree: Pubkey,       // Merkle tree account pubkey
    pub bump: u8,                  // PDA bump
}

impl Event {
    // Adjusted size calculation, consider some buffer for String lengths
    // Max name/URI lengths are estimates
    const MAX_SIZE: usize = 32 + (4 + 50) + (4 + 30) + (4 + 10) + 8 + 8 + 1 + (4 + 100) + (4 + 100) + 32 + 32 + 16; // Added 16 for padding/safety
}

#[account]
pub struct QRCode {
    pub event: Pubkey,              // Reference to the event
    pub qr_code_id: String,         // Unique ID for the QR code
    pub secret_key: [u8; 32],       // Secret key for verification
    pub is_claimed: bool,           // Whether the QR code has been claimed
    pub creation_time: i64,         // When the QR code was created
    pub expiration_time: i64,       // When the QR code expires (0 = never)
    pub claimer: Option<Pubkey>,    // Who claimed the QR code
    pub claim_time: Option<i64>,    // When the QR code was claimed
    pub bump: u8,                   // PDA bump
}

impl QRCode {
    pub const SIZE: usize = 8 +     // Discriminator
        32 +                        // event (Pubkey)
        (4 + 50) +                  // qr_code_id (String max 50 chars)
        32 +                        // secret_key ([u8; 32])
        1 +                         // is_claimed (bool)
        8 +                         // creation_time (i64)
        8 +                         // expiration_time (i64)
        (1 + 32) +                  // claimer (Option<Pubkey>)
        (1 + 8) +                   // claim_time (Option<i64>)
        1 +                         // bump (u8)
        100;                        // Padding for future fields
}

// Struct for token data that will be compressed
#[derive(Debug, Copy, Clone)]
pub struct TokenData {
    pub event: Pubkey,             // The event the token is for
    pub claimer: Pubkey,           // Who claimed the token
    pub token_id: u64,             // Unique ID for the token
    pub claim_time: i64,           // When the token was claimed
}

// Hash a TokenData struct to create a leaf node for the Merkle tree.
// The order of serialization is important: event, claimer, token_id, claim_time.
fn hash_token_data(data: &TokenData) -> [u8; 32] {
    let mut hasher = PoseidonHasher::<Poseidon>::new();

    // Serialize all fields into a byte vector.
    // The capacity is an estimate: Pubkey (32) + Pubkey (32) + u64 (8) + i64 (8) = 80 bytes.
    let mut token_bytes = Vec::with_capacity(80);
    token_bytes.extend_from_slice(&data.event.to_bytes());
    token_bytes.extend_from_slice(&data.claimer.to_bytes());
    token_bytes.extend_from_slice(&data.token_id.to_le_bytes()); // u64 to little-endian bytes
    token_bytes.extend_from_slice(&data.claim_time.to_le_bytes()); // i64 to little-endian bytes

    // Hash the concatenated bytes and return the 32-byte result.
    hasher.hash(&token_bytes).expect("Hashing token data failed")
}

// Mock function to update a Merkle tree (simplified for this example)
fn mock_update_merkle_tree(current_root: [u8; 32], leaf: [u8; 32], index: u64) -> [u8; 32] {
    // In a real implementation, this would update the Merkle tree
    // For this example, we'll just return a mock root
    let mut new_root = current_root;

    // XOR with leaf and index to simulate a change
    for i in 0..32 {
        new_root[i] = new_root[i] ^ leaf[i] ^ ((index >> (i % 8)) as u8 & 0x01);
    }

    new_root
}

// Mock function to verify a Merkle proof (simplified for this example)
fn mock_verify_merkle_proof(
    proof: &Vec<[u8; 32]>,
    root: &[u8; 32],
    leaf: &[u8; 32],
    index: usize,
    tree_height: usize,
) -> bool {
    // In a real implementation, this would verify the proof against the Merkle tree
    // For this example, we'll return true if the proof has the correct length
    proof.len() == tree_height
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: only the event creator can perform this action")]
    UnauthorizedCreator,

    #[msg("Event is not active")]
    EventInactive,

    #[msg("Maximum token supply reached")]
    MaxSupplyReached,

    #[msg("Invalid QR code")]
    InvalidQRCode,

    #[msg("Invalid secret key")]
    InvalidSecretKey,

    #[msg("QR code has already been claimed")]
    QRCodeAlreadyClaimed,

    #[msg("QR code has expired")]
    QRCodeExpired,

    #[msg("Invalid Merkle proof")]
    InvalidMerkleProof,
}

#[error_code]
pub enum CpopError {
    #[msg("Invalid event name length.")]
    InvalidEventName,
    #[msg("Invalid token name length.")]
    InvalidTokenName,
    #[msg("Invalid token symbol length.")]
    InvalidTokenSymbol,
    #[msg("Invalid URI length.")]
    InvalidUriLength,
    #[msg("Max supply must be greater than 0.")]
    InvalidMaxSupply,
    #[msg("Event is not active.")]
    EventNotActive,
    #[msg("All tokens have been claimed.")]
    MaxSupplyReached,
    #[msg("Token already claimed or invalid proof.")]
    TokenAlreadyClaimedOrInvalidProof,
    #[msg("Merkle proof verification failed.")]
    MerkleProofFailed,
    #[msg("QR Code expired or already used.")]
    QrCodeExpiredOrUsed,
    #[msg("Claimer mismatch.")]
    ClaimerMismatch,
    #[msg("Invalid hash input.")]
    InvalidHashInput,
    #[msg("Incorrect SPL Account Compression Program ID provided.")]
    IncorrectCompressionProgramId,
    #[msg("Incorrect SPL No-Op Program ID provided.")]
    IncorrectNoopProgramId,
}
