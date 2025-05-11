# Droploop: Decentralized Referral Program Architecture

## System Architecture

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────┐
│                                     │      │                                 │
│   Frontend (Next.js + React)        │      │  Solana On-Chain Programs       │
│   ┌────────────────────────────┐    │      │  ┌─────────────────────────┐    │
│   │                            │    │      │  │                         │    │
│   │   Creator Dashboard        │    │      │  │  Referral Program       │    │
│   │   - Mint cTokens           │    │      │  │  - initialize_campaign  │    │
│   │   - Generate Referral QRs  │────┼──────┼─▶│  - generate_referral    │    │
│   │   - View Referrals         │    │      │  │  - claim_reward         │    │
│   │                            │    │      │  │  - verify_referral      │    │
│   └────────────────────────────┘    │      │  │                         │    │
│                                     │      │  └─────────────┬───────────┘    │
│   ┌────────────────────────────┐    │      │                │                │
│   │                            │    │      │  ┌─────────────▼───────────┐    │
│   │   User Claim Interface     │    │      │  │                         │    │
│   │   - Scan QR Codes          │    │      │  │  Light Protocol         │    │
│   │   - Claim cTokens          │────┼──────┼─▶│  - compressed_token     │    │
│   │   - View Claimed Tokens    │    │      │  │  - stateless.js         │    │
│   │                            │    │      │  │  - state compression    │    │
│   └────────────────────────────┘    │      │  │                         │    │
│                                     │      │  └─────────────┬───────────┘    │
│   ┌────────────────────────────┐    │      │                │                │
│   │                            │    │      │  ┌─────────────▼───────────┐    │
│   │   Referral Tracker         │    │      │  │                         │    │
│   │   - Statistics             │    │      │  │  Solana SPL Tokens      │    │
│   │   - Leaderboard            │────┼──────┼─▶│  - Token Program        │    │
│   │   - Rewards History        │    │      │  │  - Associated Token     │    │
│   │                            │    │      │  │    Account Program      │    │
│   └────────────────────────────┘    │      │  │                         │    │
│                                     │      │  └─────────────────────────┘    │
└─────────────────────────────────────┘      │                                 │
                                             └─────────────────────────────────┘
┌─────────────────────────────────────┐      
│                                     │      ┌─────────────────────────────────┐
│   Wallet Integration                │      │                                 │
│   ┌────────────────────────────┐    │      │   ZK Compression               │
│   │                            │    │      │   ┌─────────────────────────┐   │
│   │   Solana Wallet Adapter    │    │      │   │                         │   │
│   │   - Connect Wallet         │    │      │   │     Merkle Tree         │   │
│   │   - Sign Transactions      │    │      │   │         │               │   │
│   │   - View Balances          │    │      │   │     ┌───┴────┐           │   │
│   │                            │    │      │   │     │        │           │   │
│   └────────────────────────────┘    │      │   │  Referrer  Referee      │   │
│                                     │      │   │   Trees    Trees        │   │
└─────────────────────────────────────┘      │   │                         │   │
                                             │   │   Compressed cTokens    │   │
                                             │   │                         │   │
                                             │   └─────────────────────────┘   │
                                             │                                 │
                                             └─────────────────────────────────┘
```

## Component Flow

### Campaign Creation Process
1. **Creator** logs into the dashboard 
2. Creator fills out campaign details (name, description, rewards, duration) and submits creation form
3. Client-side code sends transaction to initialize the campaign on-chain
4. On-chain `initialize_campaign` function:
   - Initializes campaign data
   - Sets up referrer and referee reward structures
   - Initializes compressed token state using Light Protocol
   - Creates campaign authority account
5. Campaign details are stored and displayed on dashboard

### Referral Generation Process
1. **Creator** selects a campaign and generates a referral QR code
2. Client-side code sends transaction to generate referral on-chain  
3. On-chain `generate_referral` function:
   - Creates a referral account with unique identifier
   - Links it to the creator's campaign
   - Allocates compressed token allocation for this referral
4. QR code data with referral ID is returned to frontend
5. Frontend generates and displays QR code image for sharing

### Referral Claim Process
1. **User** scans QR code or inputs referral code
2. Frontend decodes QR/referral code and extracts campaign ID and referral ID
3. Client-side code sends transaction to claim reward on-chain
4. On-chain `claim_reward` function:
   - Verifies referral validity and that it hasn't been claimed by this user
   - Creates compressed cToken with Light Protocol
   - Mints appropriate rewards to both referrer and referee
   - Records the referral relationship on-chain
   - Updates referral statistics
5. User receives confirmation of claimed reward

### Referral Verification Process
1. **User or Creator** requests to verify a referral
2. Client-side code retrieves proof of the referral relationship
3. Client-side code sends transaction to verify referral on-chain
4. On-chain `verify_referral` function:
   - Verifies the compressed cToken ownership
   - Validates the referral relationship exists
   - Returns verification result

## Light Protocol ZK Compression Integration

The Droploop referral system leverages Solana's State Compression through Light Protocol to efficiently store referral relationships and token data on-chain:

1. **Space Efficiency**: Instead of creating separate token mint accounts for each referral, all referral data is stored as compressed state, significantly reducing on-chain storage costs.

2. **Scalability**: The system can handle millions of referrals with minimal on-chain storage cost, making it ideal for viral referral campaigns.

3. **Cost Reduction**: Using Light Protocol's compressed token standard drastically reduces the cost of minting and managing tokens, enabling micro-reward systems that would be cost-prohibitive with regular SPL tokens.

4. **Proof Verification**: The system uses ZK proofs to verify referral relationships without exposing sensitive user data.

## Data Structure

### On-Chain Accounts
- **Campaign Account** (PDA): Stores campaign metadata and configuration
- **Referral Account** (PDA): Stores referral data and claim status
- **User Account** (PDA): Stores user referral statistics
- **Compressed Token State**: Stores the compressed token data managed by Light Protocol

### Compressed Token Structure
```rust
ReferralData {
  campaign: Pubkey,     // The campaign's public key
  referrer: Pubkey,     // Referrer's wallet address
  referee: Pubkey,      // Referee's wallet address (who claimed the referral)
  referral_id: String,  // Unique referral identifier
  claim_time: i64,      // Unix timestamp of claim
  reward_amount: u64,   // Amount of rewards distributed
}
```

This data is compressed using Light Protocol's compression techniques and state management.

## Security Features

1. **Double-Claim Prevention**: Referral codes can only be claimed once per user, and the system tracks claimed rewards on-chain.

2. **Campaign Duration Control**: Campaigns can have defined start and end dates, after which referrals become inactive.

3. **Unique Referral IDs**: Each referral has a unique identifier that can be traced back to the original referrer.

4. **Proof Verification**: Referral relationships and rewards are verified using Light Protocol's ZK verification.

5. **Sybil Resistance**: Optional user verification mechanisms can be implemented to prevent abuse and ensure unique users.

## Frontend-Blockchain Communication

### Light Protocol Integration Module

The frontend interacts with Light Protocol through a dedicated utility module (`lightProtocol.ts`):

```typescript
// Example of the utility functions for Light Protocol operations

// Initialize a new referral campaign
export async function initializeReferralCampaign(
  wallet: WalletContextState,
  connection: Connection,
  campaignData: {
    name: string,
    description: string,
    referrerReward: number,
    refereeReward: number,
    startDate: Date,
    endDate: Date,
    maxReferrals: number
  }
): Promise<string> {
  // Import Light Protocol libraries
  const { CompressedToken } = await import('@lightprotocol/compressed-token');
  const { StatelessKeypair } = await import('@lightprotocol/stateless.js');
  
  // Create compressed token settings for the campaign
  const compressedToken = new CompressedToken(connection, wallet);
  
  // Prepare and send the initialize campaign transaction
  const tx = await compressedToken.createToken({
    name: campaignData.name,
    symbol: 'CREF',
    uri: JSON.stringify(campaignData),
    decimals: 0,
    maxSupply: campaignData.maxReferrals * (campaignData.referrerReward + campaignData.refereeReward)
  });
  
  return tx;
}

// Generate a referral link
export async function generateReferral(
  wallet: WalletContextState,
  connection: Connection,
  campaignAddress: PublicKey
): Promise<{ referralId: string, qrData: string }> {
  // Import Light Protocol libraries
  const { CompressedToken } = await import('@lightprotocol/compressed-token');
  
  // Create unique referral ID
  const referralId = generateUniqueId();
  
  // Register referral on-chain
  const compressedToken = new CompressedToken(connection, wallet);
  await compressedToken.registerReferral(campaignAddress, referralId);
  
  // Generate QR code data
  const qrData = JSON.stringify({
    campaign: campaignAddress.toString(),
    referrer: wallet.publicKey?.toString(),
    referralId
  });
  
  return { referralId, qrData };
}

// Claim a referral reward
export async function claimReferralReward(
  wallet: WalletContextState,
  connection: Connection,
  referralData: {
    campaignAddress: PublicKey,
    referrerId: PublicKey,
    referralId: string
  }
): Promise<string> {
  // Import Light Protocol libraries
  const { CompressedToken } = await import('@lightprotocol/compressed-token');
  
  // Initialize compressed token interface
  const compressedToken = new CompressedToken(connection, wallet);
  
  // Claim the referral reward, which mints compressed tokens to both parties
  const tx = await compressedToken.claimReferral(
    referralData.campaignAddress,
    referralData.referrerId,
    referralData.referralId
  );
  
  return tx;
}
```

## Future Extensions

The Droploop referral architecture supports several potential extensions:

1. **Multi-Tier Referrals**: Implement multi-level referral rewards where users earn from their direct referrals and from referrals made by their referees.

2. **Token Utility Expansion**: Add functionality for cTokens earned through referrals to be used in various applications or exchanged for other digital assets.

3. **Dynamic Reward Structure**: Implement variable reward structures based on user activity, referral quality, or campaign performance.

4. **Enhanced Analytics**: Provide detailed analytics on referral performance, conversion rates, and campaign ROI.

5. **Community Growth Gamification**: Add leaderboards, achievements, and challenges to gamify the referral process.

6. **Cross-Campaign Interactions**: Allow users to leverage their reputation and referral history across multiple campaigns.

7. **DAO Integration**: Enable decentralized governance for setting referral parameters and reward distributions in community-owned campaigns.
