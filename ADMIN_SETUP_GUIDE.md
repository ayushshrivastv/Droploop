# Admin Setup Guide for Droploop

This guide explains how to set up the admin keypair for token distribution in the Droploop app. This is required for both referral-based token claims and airdrops to work properly.

## Setting Up Admin Keypair (For Development/Hackathon Only)

⚠️ **IMPORTANT SECURITY WARNING** ⚠️  
The approach outlined below is **ONLY for development/hackathon purposes**. In a production environment, never store private keys in frontend code or environment variables accessible to clients.

### Step 1: Create a .env.local file

Create a `.env.local` file in the root of your project with the following contents:

```
# Admin private key for token distribution (Base58 format)
# WARNING: This is only for development purposes
# In production, use a secure backend service instead
NEXT_PUBLIC_ADMIN_PRIVATE_KEY=YOUR_ADMIN_PRIVATE_KEY_HERE

# Airdrop token mint address
NEXT_PUBLIC_AIRDROP_MINT_ADDRESS=YOUR_AIRDROP_MINT_ADDRESS_HERE

# RPC Endpoint (defaults to devnet if not specified)
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Step 2: Generate Admin Keypair (if you don't have one)

If you need a new keypair for testing:

1. Install Solana CLI tools if you haven't already
2. Run `solana-keygen new --no-outfile` to generate a keypair
3. Copy the Base58 private key that's displayed
4. Paste it as the value for `NEXT_PUBLIC_ADMIN_PRIVATE_KEY` in your `.env.local` file

### Step 3: Fund the Admin Wallet

1. Get the public key address with `solana-keygen pubkey /path/to/keypair.json` or from your wallet
2. If testing on devnet, use `solana airdrop 2 YOUR_PUBLIC_KEY --url https://api.devnet.solana.com`
3. Ensure this wallet owns the compressed tokens you want to distribute

### Step 4: Configure Airdrop Mint Address

1. Replace `YOUR_AIRDROP_MINT_ADDRESS_HERE` with the actual mint address of the token you want to use for airdrops
2. Make sure the admin wallet (configured in Step 2) owns these tokens

## Modifying the Claim Form Code

Open `/src/components/claim/claim-form.tsx` and update the AIRDROP_MINT_ADDRESS constant:

```typescript
// Replace this placeholder with your actual airdrop mint address
// This should match the value in your .env.local file
const AIRDROP_MINT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_MINT_ADDRESS || 'ENTER_AIRDROP_MINT_ADDRESS_HERE';
```

## Production Considerations

For a production deployment, replace this approach with:

1. A dedicated backend service that securely manages keys
2. API endpoints that handle token transfers without exposing private keys
3. Proper authentication and authorization controls
4. Consider using session-based authentication or other secure methods

## Troubleshooting

If you encounter errors like "Admin keypair not configured" or "Airdrop mint address is not configured":

1. Check that your `.env.local` file exists and has the correct values
2. Make sure you've restarted the Next.js development server after making changes to environment variables
3. Verify that the admin wallet has sufficient SOL to pay for transaction fees
4. Ensure the admin wallet owns the tokens you're trying to distribute
