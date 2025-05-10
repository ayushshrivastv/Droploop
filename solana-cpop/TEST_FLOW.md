# ZK Compression cPOP Interface Test Flow

This document provides a step-by-step guide to test the full functionality of the cPOP Interface, including campaign creation, referral link generation, and reward claiming.

## Prerequisites

- Solana devnet SOL in your wallet (get from [Solana Faucet](https://faucet.solana.com/))
- A Solana wallet (Phantom or Solflare) installed as a browser extension
- The application running locally (`npm run dev`)

## Test Flow

### 1. Initial Setup

1. Navigate to `http://localhost:3000`
2. Connect your Solana wallet using the wallet button in the top-right corner
3. Verify that your wallet is connected to Solana Devnet

### 2. Campaign Creation

1. Navigate to the dashboard (`http://localhost:3000/dashboard`)
2. Click "Create a New Campaign" and fill in the following fields:
   - Campaign Name: "Test Campaign"
   - Reward Name: "Test Reward"
   - Reward Symbol: "TREWARD"
   - Max Referrals: 10
   - Campaign URI: "https://example.com/test-campaign"
   - Reward URI: "https://example.com/test-reward"
3. Click "Create Campaign"
4. Verify that the campaign appears in the campaign list

### 3. Referral Link Generation

1. Select your newly created campaign
2. Click "Generate New Referral Link"
3. Verify that a QR code appears with relevant information
4. Click "Copy Link" to copy the referral link to your clipboard
5. Generate a second referral link to test multiple redemptions

### 4. Reward Claiming (Test in Incognito Mode or Different Browser)

1. Open an incognito window or different browser
2. Navigate to the referral link you copied
3. Connect a different wallet (or the same wallet for testing)
4. Click "Claim Your Reward"
5. Verify that the success message appears and the reward is claimed

### 5. Verification

1. Return to the dashboard in your original browser
2. Verify that the referral link is now marked as "Used"
3. Check that the "Claimed by" field shows the wallet address that claimed the reward
4. Try to claim the same reward again to verify the anti-double-claim protection

## Checking ZK Compression Implementation

1. During campaign creation, notice the transaction logs in your wallet - this is creating a Merkle tree for compressed NFTs
2. When claiming a reward, observe that the transaction size is significantly smaller than traditional NFT mints
3. The claim process should reference the SPL Account Compression program (`cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK`) and the SPL No-Op program (`noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV`)

## Expected Results

- Campaign creation should result in a new campaign in the dashboard
- Referral link generation should create usable QR codes and links
- Claiming a reward should work once per link
- Repeated claim attempts should be rejected
- All transactions should use ZK compression for efficiency

## Troubleshooting

- If transactions fail, ensure your wallet has sufficient devnet SOL
- Check browser console for any JavaScript errors
- Verify network is set to Solana Devnet in your wallet
- Ensure the Anchor program was deployed to devnet properly

## Advanced Testing

- Try creating multiple campaigns and verify they're separated correctly
- Test with various expiration times for referral links
- Monitor transaction costs to verify compression benefits
