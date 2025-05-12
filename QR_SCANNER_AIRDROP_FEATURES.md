# QR Scanner & Airdrop Features Documentation

This document explains how to use the newly implemented QR scanner and airdrop features in the Droploop application.

## Overview

We've enhanced the Droploop platform with two key features:

1. **QR Code Scanner**: Allows users to scan referral QR codes using their device camera
2. **Airdrop Mode**: Enables token distribution without requiring a referral code

These features make it easier for users to participate in your compressed token referral program on Solana.

## QR Scanner Feature

### How It Works

The QR scanner allows users to:
- Scan QR codes that contain referral information
- Automatically extract and populate the referral code field
- Process both simple codes and complex URLs with campaign information

### Implementation Details

- Uses `html5-qrcode` library for camera access and QR processing
- Extracts data using the `parseReferralData` utility function
- Provides a clean camera interface with easy closing and retry options

### User Flow

1. User clicks the "Scan QR" button next to the referral code input
2. Camera opens with QR scanning interface
3. User scans a valid QR code containing referral information
4. The app automatically processes the code and returns to the claim form with pre-filled information
5. User can then complete the claim process

## Airdrop Mode Feature

### How It Works

The airdrop mode allows:
- Distribution of tokens without requiring a referral code
- Quick toggle between referral claiming and direct airdrop
- Simplified user experience for promotional airdrops

### Implementation Details

- Uses a configurable mint address for airdrop tokens via environment variables
- Shares the same underlying transaction infrastructure as referral claims
- Provides clear UI indicators when in airdrop mode

### User Flow

1. User clicks the "Switch to Airdrop" button in the claim form header
2. UI changes to show airdrop-specific information
3. User connects their wallet (if not already connected)
4. User clicks "Claim Airdrop" button
5. Token is transferred to their wallet

## Configuration

### Setting Up the Airdrop Mint Address

For the airdrop feature to work, you need to configure the mint address for the tokens:

1. Create a `.env.local` file in the root directory
2. Add the following environment variable:
   ```
   NEXT_PUBLIC_AIRDROP_MINT_ADDRESS=YOUR_ACTUAL_MINT_ADDRESS
   ```
3. Restart the development server

### Admin Keypair Configuration

For both features to work properly, follow the instructions in `ADMIN_SETUP_GUIDE.md` to:
1. Set up a properly funded admin keypair
2. Configure it securely for your development/hackathon environment

## Security Considerations

- The current implementation is designed for hackathon/demo purposes
- For production, a backend service should handle private key management
- See `ADMIN_SETUP_GUIDE.md` for more details on security best practices

## Light Protocol Integration

Both features leverage Light Protocol's compressed token functionality to ensure:
- Ultra-low gas fees through ZK compression
- Secure token transfers on Solana
- Scalable token distribution for your referral program

---

*This implementation is part of the Droploop platform for the 1000x Hackathon, showcasing the power of cPOP (Compressed Proof of Participation) tokens on Solana.*
