# Droploop: Decentralized Referral Program Architecture

*Updated for 1000x Hackathon ZK Compression Track Submission*

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
│   │   - Airdrop Mode           │    │      │  │  - stateless.js         │    │
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
   - Integrated QR scanner allows direct scanning from the user's device camera
   - QR codes can contain full campaign details or simple referral codes
2. Frontend processes the scanned QR data:
   - Uses `parseReferralData` utility to extract campaign and referral information
   - Automatically populates form fields with extracted data
3. Client-side code sends transaction to claim reward on-chain
4. On-chain `claim_reward` function:
   - Verifies referral validity and that it hasn't been claimed by this user
   - Creates compressed cToken with Light Protocol
   - Mints appropriate rewards to both referrer and referee
   - Records the referral relationship on-chain
   - Updates referral statistics
5. User receives confirmation of claimed reward with animated success state

### Airdrop Claim Process
1. **User** toggles to airdrop mode in the claim interface
   - UI updates to show airdrop-specific information
   - Referral code input is hidden as it's not required
2. User connects their wallet and initiates the claim
3. Client-side code sends transaction to claim airdrop on-chain
4. On-chain `claim_airdrop` function:
   - Verifies the user hasn't already claimed this airdrop
   - Creates compressed cToken with Light Protocol
   - Mints the airdrop token to the user's wallet
   - Records the claim in the compressed state
5. User receives confirmation of claimed airdrop with animated success state

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

## QR Scanner Implementation

The QR scanner component is a key feature of the Droploop platform, providing a seamless way for users to claim referral rewards:

1. **HTML5 QR Scanner Integration**: Utilizes the `html5-qrcode` library for camera access and QR processing
2. **Multi-Format Support**: Can decode both simple referral codes and complex URLs with campaign details
3. **Dynamic Data Extraction**: Uses the `parseReferralData` utility to extract meaningful data from QR codes
4. **Responsive UI**: Camera interface with clear instructions and error handling
5. **Permission Handling**: Manages camera permissions with appropriate user feedback

### QR Scanner Component Architecture

```typescript
interface QRScannerProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onCodeScanned, onClose }: QRScannerProps) {
  // Camera management and QR scanning logic
  // Permission handling
  // UI rendering for scanner interface
}
```

## Frontend-Blockchain Communication

### Light Protocol Integration Module

The frontend interacts with Light Protocol through a dedicated utility module (`transactions.ts`):

```typescript
// Example of the utility functions for Light Protocol operations

// Token transfer function for both referral claims and airdrops
export async function transferCompressedTokens(
  connection: Connection,
  payer: Keypair,
  mintAddress: PublicKey,
  amount: number,
  owner: Keypair,
  destination: PublicKey
): Promise<string> {
  // Create and send transaction to transfer compressed tokens
  // using Light Protocol's compression standards
  
  // In a production environment, this would interact with
  // Light Protocol's SDK to create transfer instructions
  
  // For the hackathon demo, we've implemented a simulation mode
  // that can operate without requiring real blockchain interaction
  
  const transaction = createCompressedTokenTransferTransaction(
    payer.publicKey,
    owner.publicKey,
    destination,
    mintAddress,
    amount
  );
  
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, owner],
    { commitment: 'confirmed' }
  );
  
  return signature;
}

// Helper function for initiating token transfers from the claim form
export async function initiateCompressedTokenTransfer(
  connection: Connection,
  recipient: PublicKey,
  tokenMintAddress: string,
  referralCode?: string | null
): Promise<string> {
  // Get admin keypair securely (in production, this would be handled by backend)
  const adminKeypair = getAdminKeypair();
  
  // Support both referral claiming and airdrop modes
  // If referralCode is provided, this is a referral claim
  // Otherwise, it's an airdrop claim
  
  // Execute the token transfer using Light Protocol
  const signature = await transferCompressedTokens(
    connection,
    adminKeypair,
    new PublicKey(tokenMintAddress),
    1, // Amount to transfer (typically 1 for NFT/POP token)
    adminKeypair,
    recipient
  );
  
  // Track referral relationship if this is a referral claim
  if (referralCode) {
    await trackReferral(referralCode, signature, recipient.toBase58());
  }
  
  return signature;
}
```

## Demo Mode Implementation

For the hackathon demonstration, we've implemented a special demo mode that allows the application to function without requiring actual blockchain transactions:

1. **Simulated Transactions**: Token transfers are simulated with realistic delays and signatures
2. **Environment Configuration**: Simple setup via environment variables for demo purposes
3. **Console Feedback**: Detailed logging to verify operation without blockchain interaction
4. **Toggle Mechanism**: Easy switch between demo mode and real transactions for testing

This implementation ensures judges and users can experience the full application flow without needing to set up wallets with real SOL or own compressed tokens.

## Future Extensions

The Droploop referral architecture supports several potential extensions:

1. **Multi-Tier Referrals**: Implement multi-level referral rewards where users earn from their direct referrals and from referrals made by their referees.

2. **Token Utility Expansion**: Add functionality for cTokens earned through referrals to be used in various applications or exchanged for other digital assets.

3. **Dynamic Reward Structure**: Implement variable reward structures based on user activity, referral quality, or campaign performance.

4. **Enhanced Analytics**: Provide detailed analytics on referral performance, conversion rates, and campaign ROI.

5. **Community Growth Gamification**: Add leaderboards, achievements, and challenges to gamify the referral process.

6. **Cross-Campaign Interactions**: Allow users to leverage their reputation and referral history across multiple campaigns.

7. **DAO Integration**: Enable decentralized governance for setting referral parameters and reward distributions in community-owned campaigns.
