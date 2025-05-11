use anchor_lang::prelude::*;
use anchor_spl::token;
use light_merkle_tree_reference::MerkleTree;
use light_poseidon::PoseidonHasher;
use light_concurrent_merkle_tree::ConcurrentMerkleTree;
use light_hasher::Poseidon;
use solana_program::program_error::ProgramError;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Define constants for the Merkle tree used for ZK Compression
const MERKLE_TREE_HEIGHT: usize = 20; // Height of the Merkle tree (supports 2^20 leaf nodes)
const MAX_BUFFER_SIZE: usize = 256;   // Maximum number of concurrent operations

#[program]
pub mod cpop {
    use super::*;

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
        event.bump = *ctx.bumps.get("event").unwrap();

        // Initialize a new empty Merkle tree for this event's tokens
        event.merkle_root = [0; 32]; // Initial empty Merkle root

        msg!("Event initialized with cToken: {}", event.token_name);
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

        // Verify QR code
        require_eq!(qr_code.qr_code_id, qr_code_id, ErrorCode::InvalidQRCode);
        require_eq!(qr_code.secret_key, secret_key, ErrorCode::InvalidSecretKey);

        // Check if QR is already claimed
        require!(!qr_code.is_claimed, ErrorCode::QRCodeAlreadyClaimed);

        // Check if QR code is expired
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time <= qr_code.expiration_time || qr_code.expiration_time == 0,
            ErrorCode::QRCodeExpired
        );

        // Mark QR code as claimed
        qr_code.is_claimed = true;
        qr_code.claimer = Some(claimer.key());
        qr_code.claim_time = Some(current_time);

        // Update event claimed count
        event.claimed_count += 1;

        // Create compressed token data
        let token_data = TokenData {
            event: event.key(),
            claimer: claimer.key(),
            token_id: event.claimed_count,
            claim_time: current_time,
        };

        // Add token data to the Merkle tree (in a real implementation)
        // Here we would:
        // 1. Create a new leaf node from token data
        // 2. Insert it into the concurrent Merkle tree
        // 3. Update the Merkle root in the event account

        // For demonstration, we use a mock to simulate the Merkle tree update
        let leaf = hash_token_data(&token_data);
        event.merkle_root = mock_update_merkle_tree(event.merkle_root, leaf, event.claimed_count);

        msg!("Token claimed by: {}", claimer.key());
        Ok(())
    }

    /// Verify token ownership using ZK proof
    pub fn verify_token(
        ctx: Context<VerifyToken>,
        token_id: u64,
        merkle_proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        let claimer = &ctx.accounts.claimer;

        // Create token data to verify
        let token_data = TokenData {
            event: event.key(),
            claimer: claimer.key(),
            token_id,
            claim_time: 0, // We don't know the claim time, but it's part of the hash
        };

        // Hash the token data to get the leaf
        let leaf = hash_token_data(&token_data);

        // Verify the Merkle proof (simplified for this example)
        // In a real implementation, we would use the ZK verification libraries
        let verified = mock_verify_merkle_proof(
            &merkle_proof,
            &event.merkle_root,
            &leaf,
            token_id as usize,
            MERKLE_TREE_HEIGHT,
        );

        require!(verified, ErrorCode::InvalidMerkleProof);

        msg!("Token verified for claimer: {}", claimer.key());
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
#[instruction(
    event_name: String,
    token_name: String,
    token_symbol: String,
    max_supply: u64,
    event_uri: String,
    token_uri: String,
)]
pub struct InitializeEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = Event::SIZE,
        seeds = [b"event", creator.key().as_ref(), event_name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(qr_code_id: String, secret_key: [u8; 32], expiration_time: i64)]
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
}

#[derive(Accounts)]
#[instruction(token_id: u64, merkle_proof: Vec<[u8; 32]>)]
pub struct VerifyToken<'info> {
    #[account(
        seeds = [b"event", event.creator.as_ref(), event.event_name.as_bytes()],
        bump = event.bump
    )]
    pub event: Account<'info, Event>,

    pub claimer: Signer<'info>,

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
    pub bump: u8,                  // PDA bump
}

impl Event {
    pub const SIZE: usize = 8 +     // Discriminator
        32 +                        // creator (Pubkey)
        (4 + 50) +                  // event_name (String max 50 chars)
        (4 + 50) +                  // token_name (String max 50 chars)
        (4 + 10) +                  // token_symbol (String max 10 chars)
        8 +                         // max_supply (u64)
        8 +                         // claimed_count (u64)
        1 +                         // is_active (bool)
        (4 + 200) +                 // event_uri (String max 200 chars)
        (4 + 200) +                 // token_uri (String max 200 chars)
        32 +                        // merkle_root ([u8; 32])
        1 +                         // bump (u8)
        100;                        // Padding for future fields
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

// Hash a TokenData struct to create a leaf node
fn hash_token_data(data: &TokenData) -> [u8; 32] {
    // In a real implementation, we would use Poseidon hash
    // For this example, we'll just create a simple mock hash
    let mut hasher = PoseidonHasher::<Poseidon>::new();

    // Add all fields to the hasher
    let mut token_bytes = Vec::with_capacity(32 + 32 + 8 + 8);
    token_bytes.extend_from_slice(&data.event.to_bytes());
    token_bytes.extend_from_slice(&data.claimer.to_bytes());
    token_bytes.extend_from_slice(&data.token_id.to_le_bytes());
    token_bytes.extend_from_slice(&data.claim_time.to_le_bytes());

    // Hash the data and return the result
    hasher.hash(&token_bytes).unwrap()
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
