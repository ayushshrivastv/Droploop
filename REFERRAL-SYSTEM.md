# Droploop Referral System Documentation

## Overview

Droploop is a decentralized referral program built on Solana that leverages ZK Compression technology to create a cost-effective, scalable solution for community growth. This document outlines the architecture, components, and workflows of the Droploop referral system.

## Architecture

The Droploop referral system consists of three main components:

1. **Frontend**: A Next.js application with React and Tailwind CSS
2. **Solana Program**: An on-chain program that handles the referral logic and compressed token minting
3. **Light Protocol Integration**: For ZK Compression to reduce on-chain costs by ~1000x

### Key Technologies

- **Solana Blockchain**: Provides the foundation for our decentralized application
- **Light Protocol**: Enables ZK Compression for token state, reducing costs and increasing scalability
- **Next.js**: Frontend framework for the user interface
- **React + Tailwind CSS**: For building the UI components
- **QR Code Generation**: For creating shareable referral links

## Core Components

### 1. Referral Campaign Creation

Campaign creators can define referral campaigns with the following parameters:

- Campaign name and description
- Campaign end date
- Referrer reward (tokens per successful referral)
- Referee reward (tokens for new users)
- Total token supply for the campaign

### 2. Referral QR Codes

Each campaign can generate unique QR codes that:

- Encode a referral link with the referrer's address
- Can be shared via any digital channel
- Allow tracking of who referred whom

### 3. Claim Process

New users can join the platform by:

- Scanning a referral QR code
- Connecting their Solana wallet
- Claiming their tokens via the ZK-compressed mint process

When a new user joins through a referral:
- The referrer receives reward tokens
- The new user receives their welcome tokens
- All transactions are compressed using Light Protocol

### 4. Profile & Statistics

Users can track their referral performance through:

- Total number of active referral links
- Successful claims (conversions)
- Conversion rate
- Total rewards earned

## Technical Implementation

### Solana Program

Our Solana program (`/solana-program/src/lib.rs`) implements the following instructions:

1. `InitializeCampaign`: Creates a new referral campaign
2. `CreateReferral`: Generates a new referral link for a user
3. `ClaimReferral`: Processes a claim when a new user joins through a referral

These instructions interact with the following account structures:

```rust
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

pub struct ReferralAccount {
    pub campaign_id: Pubkey,
    pub referrer: Pubkey,
    pub referral_code: String,
    pub successful_claims: u64,
    pub is_active: bool,
}
```

### Light Protocol Integration

ZK Compression is implemented through Light Protocol to provide:

- 1000x reduction in on-chain state costs
- Efficient minting of large numbers of compressed tokens
- Scalable referral campaigns that can support thousands of participants

### Referral Code Format

Referral codes follow this format:
```
ref_{first8CharsOfReferrer}_{last8CharsOfCampaign}_{randomChars}
```

Example: `ref_Ax7Zb3_cDe5Fg2_r4nd0m`

This format ensures:
- Uniqueness across referrals
- Association with specific campaigns
- Efficient storage on-chain

## User Flows

### Campaign Creator Flow

1. Creator connects their wallet
2. Navigates to "Create Referral Campaign"
3. Enters campaign details and token parameters
4. Confirms transaction to initialize the campaign
5. Receives shareable QR codes for the campaign
6. Tracks campaign performance in their profile

### Referrer Flow

1. User connects their wallet
2. Navigates to the profile page
3. Views and shares their referral QR codes/links
4. Tracks successful referrals and earned rewards

### New User (Referee) Flow

1. User scans a referral QR code or clicks a referral link
2. Connects their Solana wallet
3. Claims their welcome tokens through the claim page
4. Can start referring others once they've joined

## Frontend Routes

- **`/mint`**: Create referral campaigns
- **`/claim`**: Join through a referral
- **`/profile`**: View tokens and track referral performance

## Future Enhancements

1. **Mobile App Integration**: Native mobile app for easier QR scanning
2. **Social Sharing**: Direct integration with social media platforms
3. **Tiered Rewards**: Multiple reward levels based on referral performance
4. **Analytics Dashboard**: Advanced analytics for campaign creators
5. **Multiple Campaign Types**: Different referral structures for various use cases

## API Reference

For detailed API documentation of our Solana program, refer to in-line code documentation in `/solana-program/src/lib.rs`.

## Conclusion

The Droploop referral system demonstrates the power of ZK Compression on Solana, enabling scalable, cost-effective referral campaigns that would be prohibitively expensive with traditional token implementations. By reducing on-chain costs by approximately 1000x, Droploop makes large-scale referral programs accessible to a wide range of applications and communities.
