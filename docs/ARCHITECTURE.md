# Droploop: Decentralized Referral System Architecture

## Overview

Droploop is a decentralized referral program built on the Solana blockchain, leveraging Light Protocol's ZK compression technology. The system enables businesses and creators to generate, distribute, and track referral tokens with minimal costs and maximum efficiency. By using compressed tokens, Droploop achieves significant cost reductions and scalability improvements compared to traditional token-based referral systems.

This document outlines the technical architecture, user workflows, and implementation details of the system.

## System Architecture

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────┐
│                                     │      │                                 │
│   Frontend (Next.js + React)        │      │  Solana Blockchain              │
│   ┌────────────────────────────┐    │      │  ┌─────────────────────────┐    │
│   │                            │    │      │  │                         │    │
│   │   Creator Dashboard        │    │      │  │  Light Protocol         │    │
│   │   - Create Referral Program│    │      │  │  - Compressed Tokens    │    │
│   │   - Generate QR Codes      │────┼──────┼─▶│  - State Compression    │    │
│   │   - Track Referrals        │    │      │  │  - Transfer Tokens      │    │
│   │   - Monitor Analytics      │    │      │  │  - Verify Claims        │    │
│   │                            │    │      │  │                         │    │
│   └────────────────────────────┘    │      │  └─────────────┬───────────┘    │
│                                     │      │                │                │
│   ┌────────────────────────────┐    │      │  ┌─────────────▼───────────┐    │
│   │                            │    │      │  │                         │    │
│   │   User Claim Interface     │    │      │  │  Solana Token Programs  │    │
│   │   - Scan QR Codes          │    │      │  │  - SPL Token            │    │
│   │   - Claim Referral Rewards  │────┼──────┼─▶│  - Associated Token    │    │
│   │   - View Claimed Rewards    │    │      │  │    Account Program     │    │
│   │                            │    │      │  │                         │    │
│   └────────────────────────────┘    │      │  └─────────────────────────┘    │
│                                     │      │                                 │
└─────────────────────────────────────┘      └─────────────────────────────────┘

┌─────────────────────────────────────┐      ┌─────────────────────────────────┐
│                                     │      │                                 │
│   Wallet Integration                │      │   ZK Compression Technology     │
│   ┌────────────────────────────┐    │      │   ┌─────────────────────────┐   │
│   │                            │    │      │   │                         │   │
│   │   Solana Wallet Adapter    │    │      │   │   State Trees           │   │
│   │   - Connect Wallet         │    │      │   │   - Merkle Tree         │   │
│   │   - Sign Transactions      │    │      │   │   - Zero-Knowledge      │   │
│   │   - View Token Balances    │    │      │   │     Proofs              │   │
│   │                            │    │      │   │                         │   │
│   └────────────────────────────┘    │      │   │   1000x Cost Reduction  │   │
│                                     │      │   │   500x Speed Increase   │   │
└─────────────────────────────────────┘      │   │                         │   │
                                             │   └─────────────────────────┘   │
                                             │                                 │
                                             └─────────────────────────────────┘
```

## Core Components

### 1. Creator Dashboard

The Creator Dashboard is the primary interface for businesses and creators to set up and manage their referral programs:

- **Referral Program Creation**: Set up new referral programs with customizable parameters including token supply, reward amounts, and program duration
- **QR Code Generation**: Create unique QR codes for each referral that can be shared with potential referrers
- **Analytics Dashboard**: Track referral performance, claim rates, and program effectiveness
- **Token Management**: Monitor and manage the distribution of compressed tokens

### 2. User Claim Interface

The User Claim Interface allows users to claim referral rewards:

- **QR Code Scanner**: Scan referral QR codes to claim rewards
- **Wallet Connection**: Connect Solana wallet to receive compressed tokens
- **Reward History**: View history of claimed referral rewards

### 3. Light Protocol Integration

The system leverages Light Protocol's compression technology for efficient token operations:

- **Compressed Tokens**: Create and transfer tokens at a fraction of the cost of standard SPL tokens
- **State Compression**: Utilize ZK proofs to compress on-chain state
- **Fallback Mechanism**: Gracefully degrade to standard token operations when Light Protocol methods are unavailable

## Workflow Processes

### Referral Program Creation

1. **Creator** connects their Solana wallet to the application
2. Creator fills out referral program details (name, description, reward amount, etc.)
3. System creates a compressed token mint using Light Protocol
4. Tokens are minted to the creator's wallet for distribution
5. Program details and token information are stored and displayed on the dashboard

### QR Code Generation

1. **Creator** selects an existing referral program
2. System generates unique QR codes containing:
   - Referral program ID
   - Token claim instructions
   - Creator's wallet address as the token source
3. QR codes are rendered for display, download, or sharing

### Referral Claim Process

1. **User** scans a referral QR code with their device
2. User is directed to the claim interface
3. User connects their Solana wallet
4. System verifies the referral code validity
5. Compressed tokens are transferred from the creator's wallet to the user's wallet
6. Transaction is recorded and analytics are updated

## Technical Implementation

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI**: React with Tailwind CSS and Shadcn UI components
- **State Management**: React Context API
- **Wallet Integration**: Solana Wallet Adapter

### Backend

- **API Routes**: Next.js API routes for server-side operations
- **Blockchain Interaction**: Web3.js and Light Protocol libraries
- **Token Operations**: Light Protocol's compressed-token and stateless.js libraries

### Blockchain

- **Network**: Solana (Mainnet/Devnet)
- **Token Standard**: Compressed tokens via Light Protocol
- **Fallback**: Standard SPL tokens when Light Protocol is unavailable

## Scalability and Cost Benefits

Droploop's implementation of Light Protocol's compression technology offers significant advantages:

- **Cost Reduction**: Up to 1000× lower transaction costs compared to standard token operations
- **Throughput**: Ability to process hundreds of referrals in a single transaction
- **Storage Efficiency**: 100× reduction in on-chain storage requirements

These benefits make Droploop ideal for large-scale referral programs that would otherwise be cost-prohibitive on traditional blockchain systems.
2. Their Solana wallet application launches and displays the transaction details
3. Attendee confirms the transaction to claim the token
4. On-chain `claim_token` function:
   - Verifies the claim eligibility
   - Transfers a compressed cToken to the attendee's wallet
   - Records the claim in the event records
   - Updates token distribution statistics
5. Attendee receives confirmation of claimed token in their wallet

## User Experience Workflows

### Event Organizer Journey

1. **Onboarding & Authentication**
   - Organizer visits the platform and connects their Solana wallet (Phantom, Backpack, or Solflare)
   - The system recognizes the wallet address and loads any existing events created by this organizer
   - First-time users are presented with a brief tutorial on creating and managing events

2. **Event Creation**
   - Organizer navigates to the "Create Event" section from the dashboard
   - Completes a multi-step form with event details:
     - Basic Information: Name, date, location, description
     - Token Configuration: Name, symbol, supply, metadata attributes
     - Branding: Upload event logo and customize token appearance
   - Reviews all information before submitting
   - System provides real-time feedback on transaction status and confirmation

3. **Token Distribution Management**
   - After successful event creation, organizer is redirected to the event management dashboard
   - Dashboard displays key metrics: tokens minted, tokens claimed, unique participants
   - Organizer can generate QR codes in various formats:
     - Individual codes for one-time claims
     - Batch codes for specific attendee groups
     - Master codes for event staff to distribute
   - Export options for QR codes: PDF sheets, individual image files, or embedded in emails

4. **Monitoring & Analytics**
   - Real-time claim tracking shows which tokens have been claimed and when
   - Geographic distribution of claims (if location data is available)
   - Time-based analytics showing claim patterns throughout the event
   - Export functionality for post-event reporting

### Attendee Journey

1. **Token Discovery**
   - Attendee encounters a QR code at an event (physical signage, digital display, or event materials)
   - QR code includes brief instructions and the event branding for context

2. **Scanning & Wallet Connection**
   - Attendee scans the QR code using their phone's camera or a QR scanner app
   - If they have a Solana wallet installed, it automatically launches
   - First-time users are guided to install a compatible wallet with simple instructions

3. **Token Claiming**
   - Wallet displays the claim transaction details including:
     - Event name and organizer information
     - Token description and attributes
     - Network fee estimate (minimal due to compression)
   - Attendee approves the transaction with a single tap
   - System provides immediate feedback on successful claim

4. **Post-Claim Experience**
   - Confirmation screen shows the claimed token with animation
   - Options to view the token in their wallet or return to the event page
   - Social sharing functionality to showcase their participation
   - Optional: Links to related events or additional resources

## Light Protocol ZK Compression Integration

The Scalable cToken system leverages Solana's State Compression through Light Protocol to efficiently store and distribute tokens:

1. **Storage Efficiency**: Instead of creating separate token mint accounts for each participant, all token data is stored as compressed state, significantly reducing on-chain storage costs by approximately 1000x.

2. **Scalability**: The system can handle thousands of token distributions with minimal on-chain storage cost, making it ideal for large-scale events with many attendees.

3. **Throughput Optimization**: Light Protocol enables minting up to 1,000 tokens per transaction, compared to just 1 with traditional NFTs.

4. **Cost Reduction**: Using Light Protocol's compressed token standard drastically reduces the cost of minting and distributing tokens, making it economically viable for events of any size.

5. **Technical Implementation**: The system uses Light Protocol's stateless.js and compressed-token libraries to handle the ZK proofs and state compression operations.

## Data Structure

### On-Chain Accounts

1. **Event Account**
   - Authority (Pubkey)
   - Event Name (String)
   - Event Description (String)
   - Event Time (i64)
   - Event Location (String)
   - Total Supply (u64)
   - Tokens Claimed (u64)
   - Active Status (bool)
   - Merkle Root (32 bytes)

2. **Claim Account**
   - Attendee (Pubkey)
   - Event ID (Pubkey)
   - Token ID (u64)
   - Timestamp (i64)
   - Status (enum: Claimed, Pending, Failed)

### Compressed Token Structure

```
CompressedToken {
    event_id: Pubkey,       // References the event account
    serial_number: u64,     // Unique token identifier within the event
    recipient: Pubkey,      // Wallet address of the token recipient
    metadata: {
        name: String,       // Token name (usually event name + token number)
        symbol: String,     // Token symbol
        uri: String,        // Link to metadata JSON
        attributes: [       // Additional token attributes
            {
                trait_type: String,
                value: String
            }
        ]
    }
}
```

## Security Features

1. **Authority Validation**: Only the event creator can mint tokens and generate valid QR codes for their events.

2. **Dual-Signature Verification**: Token claims require valid signatures from both the event authority and the claiming wallet.

3. **On-Chain Verification**: All token claims are verified on-chain to prevent duplicate or fraudulent claims.

4. **Time-Bound Claims**: Events can specify claim periods to limit when tokens can be claimed.

5. **Merkle Proof Validation**: Light Protocol uses Merkle proofs to verify token authenticity without exposing the entire token dataset.

## Frontend-Blockchain Communication

### Solana Pay Integration Module

The application integrates with Solana Pay to create a seamless user experience:

1. **QR Code Generation**:
   ```typescript
   // Create a Solana Pay transaction request
   const transactionRequest = new TransactionRequestURL({
     link: new URL(`https://${baseUrl}/api/claim`),
     label: eventName,
     message: `Claim your proof-of-participation token for ${eventName}`,
     params: {
       eventId: eventAccount.toString(),
       recipient: 'recipient_wallet', // To be filled by wallet app
     }
   });

   // Generate QR code from URL
   const qrCode = transactionRequest.toString();
   ```

2. **Transaction Construction**:
   ```typescript
   // When user scans the QR code, construct the token claim transaction
   const transaction = new Transaction()
     .add(
       createClaimTokenInstruction({
         eventAccount: new PublicKey(eventId),
         recipientAccount: new PublicKey(recipient),
         systemProgram: SystemProgram.programId,
       })
     );
   ```

3. **Light Protocol Integration**:
   ```typescript
   import {
     LightProtocolCompression,
     createMintCompressedTokenInstruction
   } from '@lightprotocol/stateless.js';

   // Create a compressed token instruction
   const mintIx = createMintCompressedTokenInstruction({
     payer: organizer.publicKey,
     eventAccount: eventPublicKey,
     merkleTree: merkleTreePublicKey,
     metadata: eventMetadata,
     mintAuthority: organizer.publicKey,
     recipient: attendee.publicKey,
   });
   ```

## Future Extensions

1. **Tiered Referral Programs**: Enable businesses to create multi-level referral programs with different reward tiers for direct and indirect referrals.

2. **Custom Reward Structures**: Allow creators to define complex reward structures based on referral volume, user demographics, or other custom criteria.

3. **Verification Mechanisms**: Add additional verification layers such as social proof verification or time-window restrictions for referral claims.

4. **Reward Utility Expansion**: Implement mechanisms for referral reward recipients to redeem benefits, discounts, or access to exclusive content.

5. **Enhanced Analytics Dashboard**: Develop comprehensive analytics for businesses to track referral performance, conversion rates, and ROI metrics.

6. **Cross-Chain Compatibility**: Expand the system to allow referral rewards across multiple blockchain networks.

## Planned Backend Enhancements

The current implementation focuses on delivering a functional and user-friendly referral system interface. In the coming development phases, we plan to enhance the backend with the following improvements:

### Security Enhancements

1. **Advanced Access Control**: Implement role-based access control for enterprise referral program management.
   - Role-based permissions for business referral program management teams
   - Multi-signature requirements for high-value referral reward operations
   - Rate limiting to prevent abuse of the referral claiming system

2. **Enhanced Transaction Security**
   - Implement additional verification layers for referral claims
   - Fraud detection system to identify suspicious claiming patterns
   - Revocation mechanisms for compromised referral QR codes

3. **Data Protection**
   - End-to-end encryption for sensitive referral program data
   - Privacy-preserving analytics that maintain user anonymity
   - Compliance with data protection regulations (GDPR, CCPA)

### Testing and Quality Assurance

1. **Comprehensive Test Suite**
   - Unit tests for all smart contract functions
   - Integration tests for the entire referral lifecycle
   - Load testing to verify performance at scale (10,000+ simultaneous users)

2. **Security Audits**
   - Third-party security audit of smart contracts
   - Penetration testing of the web application
   - Formal verification of critical contract functions

3. **Performance Optimization**
   - Benchmarking and optimization of compressed token operations
   - Caching strategies for frequently accessed referral data
   - Gas optimization for all on-chain operations

### Feature Expansion

1. **Advanced Referral Functionality**
   - Multi-level referral tracking for network marketing models
   - Time-limited referral campaigns with automatic expiration
   - Customizable reward distribution for different user segments

2. **Integration Ecosystem**
   - API endpoints for third-party marketing platforms
   - Webhook support for real-time referral notifications
   - SDK for developers to build on top of the Droploop infrastructure

3. **Community and Business Tools**
   - Dashboard for businesses to track referral performance
   - A/B testing tools for optimizing referral campaigns
   - Template library for quick referral program deployment

These enhancements will further strengthen the platform's security, reliability, and scalability while maintaining the intuitive user experience that makes Droploop accessible to both businesses and users in the referral ecosystem.
