use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    program::{invoke, invoke_signed},
    sysvar::{rent::Rent, Sysvar},
};
use borsh::{BorshDeserialize, BorshSerialize};

// Program ID will be determined upon deployment
solana_program::declare_id!("Dropxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum ReferralInstruction {
    /// Initialize a new referral campaign
    /// Accounts expected:
    /// 0. `[signer]` Creator account
    /// 1. `[writable]` Campaign account (PDA)
    /// 2. `[writable]` System program
    InitializeCampaign {
        campaign_name: String,
        campaign_description: String,
        end_date: u64, // Unix timestamp
        referrer_reward: u64, // Number of tokens as reward
        referee_reward: u64, // Number of tokens for new users
        token_supply: u64, // Total supply for the campaign
    },

    /// Create a referral link
    /// Accounts expected:
    /// 0. `[signer]` Referrer account
    /// 1. `[writable]` Referral account (PDA)
    /// 2. `[]` Campaign account (PDA)
    /// 3. `[writable]` System program
    CreateReferral {
        campaign_id: Pubkey, // Campaign this referral belongs to
        referral_code: String, // A unique code for this referral
    },

    /// Claim a token via referral
    /// Accounts expected:
    /// 0. `[signer]` Claimer account (new user)
    /// 1. `[writable]` Referral account (PDA)
    /// 2. `[writable]` Referrer account
    /// 3. `[writable]` Campaign account (PDA)
    /// 4. `[writable]` Light Protocol state account
    /// 5. `[writable]` System program
    ClaimReferral {
        referral_code: String, // The code used for referral
    },
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CampaignAccount {
    pub creator: Pubkey,
    pub campaign_name: String,
    pub campaign_description: String,
    pub end_date: u64,
    pub referrer_reward: u64,
    pub referee_reward: u64,
    pub token_supply: u64,
    pub remaining_supply: u64,
    pub successful_claims: u64,
    pub is_active: bool,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ReferralAccount {
    pub campaign_id: Pubkey,
    pub referrer: Pubkey,
    pub referral_code: String,
    pub successful_claims: u64,
    pub is_active: bool,
}

// Program entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction data
    let instruction = ReferralInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        ReferralInstruction::InitializeCampaign {
            campaign_name,
            campaign_description,
            end_date,
            referrer_reward,
            referee_reward,
            token_supply,
        } => {
            msg!("Instruction: Initialize Campaign");
            process_initialize_campaign(
                program_id,
                accounts,
                campaign_name,
                campaign_description,
                end_date,
                referrer_reward,
                referee_reward,
                token_supply,
            )
        }
        ReferralInstruction::CreateReferral {
            campaign_id,
            referral_code,
        } => {
            msg!("Instruction: Create Referral");
            process_create_referral(program_id, accounts, campaign_id, referral_code)
        }
        ReferralInstruction::ClaimReferral { referral_code } => {
            msg!("Instruction: Claim Referral");
            process_claim_referral(program_id, accounts, referral_code)
        }
    }
}

// Initialize a new referral campaign
fn process_initialize_campaign(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    campaign_name: String,
    campaign_description: String,
    end_date: u64,
    referrer_reward: u64,
    referee_reward: u64,
    token_supply: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the account info
    let creator_account = next_account_info(account_info_iter)?;
    let campaign_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Ensure the creator is the signer
    if !creator_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create campaign data
    let campaign_data = CampaignAccount {
        creator: *creator_account.key,
        campaign_name,
        campaign_description,
        end_date,
        referrer_reward,
        referee_reward,
        token_supply,
        remaining_supply: token_supply,
        successful_claims: 0,
        is_active: true,
    };

    // Serialize and store the campaign data
    campaign_data.serialize(&mut *campaign_account.data.borrow_mut())?;

    msg!("Campaign initialized: {}", campaign_name);
    Ok(())
}

// Create a new referral link
fn process_create_referral(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    campaign_id: Pubkey,
    referral_code: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the account info
    let referrer_account = next_account_info(account_info_iter)?;
    let referral_account = next_account_info(account_info_iter)?;
    let campaign_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Ensure the referrer is the signer
    if !referrer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check if the campaign is valid and active
    let campaign_data = CampaignAccount::try_from_slice(&campaign_account.data.borrow())?;
    if !campaign_data.is_active || campaign_data.remaining_supply == 0 {
        return Err(ProgramError::InvalidAccountData);
    }

    // Create referral data
    let referral_data = ReferralAccount {
        campaign_id,
        referrer: *referrer_account.key,
        referral_code,
        successful_claims: 0,
        is_active: true,
    };

    // Serialize and store the referral data
    referral_data.serialize(&mut *referral_account.data.borrow_mut())?;

    msg!("Referral created for campaign: {}", campaign_id);
    Ok(())
}

// Claim a token via referral
fn process_claim_referral(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    referral_code: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get the account info
    let claimer_account = next_account_info(account_info_iter)?;
    let referral_account = next_account_info(account_info_iter)?;
    let referrer_account = next_account_info(account_info_iter)?;
    let campaign_account = next_account_info(account_info_iter)?;
    let light_protocol_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Ensure the claimer is the signer
    if !claimer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify referral data
    let mut referral_data = ReferralAccount::try_from_slice(&referral_account.data.borrow())?;
    if !referral_data.is_active || referral_data.referral_code != referral_code {
        return Err(ProgramError::InvalidAccountData);
    }

    // Verify campaign data
    let mut campaign_data = CampaignAccount::try_from_slice(&campaign_account.data.borrow())?;
    if !campaign_data.is_active || campaign_data.remaining_supply < (campaign_data.referrer_reward + campaign_data.referee_reward) {
        return Err(ProgramError::InvalidAccountData);
    }

    // Update campaign data
    campaign_data.successful_claims += 1;
    campaign_data.remaining_supply -= (campaign_data.referrer_reward + campaign_data.referee_reward);
    
    // Update referral data
    referral_data.successful_claims += 1;

    // TODO: Integration with Light Protocol for ZK-compressed token minting
    // This would involve calling Light Protocol's contract to mint compressed tokens
    // for both the referrer and the new user
    
    // In an actual implementation, we would:
    // 1. Mint referee_reward tokens to the claimer
    // 2. Mint referrer_reward tokens to the referrer
    // 3. Use ZK compression to make this efficient

    // Serialize and update accounts
    campaign_data.serialize(&mut *campaign_account.data.borrow_mut())?;
    referral_data.serialize(&mut *referral_account.data.borrow_mut())?;

    msg!("Referral claimed by: {}", claimer_account.key);
    Ok(())
}
