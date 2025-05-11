# Deployment Guide for cPOP ZK Compression Interface

This guide provides step-by-step instructions for deploying the cPOP ZK Compression Interface to Solana devnet.

## Prerequisites

1. Solana CLI installed and configured
2. Anchor CLI installed (via Cargo: `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`)
3. A Solana wallet with devnet SOL for deployment costs
4. Node.js and npm/yarn installed

## Deploy Smart Contracts to Devnet

### 1. Build the Anchor Program

```bash
cd anchor-program
anchor build
```

This will generate a new build in the `target/deploy` directory.

### 2. Update Program IDs (if necessary)

If you generated a new keypair for your program, update the program ID in:
- `Anchor.toml`
- `programs/cpop/src/lib.rs` (in the `declare_id!` macro)
- The frontend client code that interfaces with the program

### 3. Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

This will deploy your program to Solana devnet.

### 4. Verify Deployment

```bash
solana program show --programs
```

Check that your program ID appears in the list with the correct upgrade authority.

## Frontend Deployment

### 1. Update Environment Variables

Create a `.env.production` file with the appropriate variables:

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_CPOP_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
NEXT_PUBLIC_SPL_ACCOUNT_COMPRESSION_PROGRAM_ID=cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK
NEXT_PUBLIC_SPL_NOOP_PROGRAM_ID=noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV
```

### 2. Build the Frontend

```bash
npm run build
```

### 3. Deploy to Hosting Service

#### Option 1: Netlify

```bash
npx netlify deploy --prod
```

#### Option 2: Vercel

```bash
npx vercel --prod
```

## Testing the Deployed Application

1. Navigate to your deployed frontend URL
2. Connect your Solana wallet (set to devnet)
3. Create a test event with the following steps:
   - Fill out the event details
   - Submit the transaction to initialize the event
   - Generate QR codes for the event
4. Test token claiming:
   - Scan a QR code with another wallet
   - Verify that the token is successfully claimed
   - Check that the event's claimed count has increased

## Troubleshooting

### Common Issues

1. **Transaction Errors**:
   - Check for sufficient SOL in your wallet for transaction fees
   - Verify that program IDs are correctly referenced

2. **Merkle Tree Initialization Failures**:
   - Ensure the Merkle tree account has sufficient space allocated
   - Check that the SPL Account Compression program ID is correctly referenced

3. **QR Code Claim Issues**:
   - Verify that the QR code has not expired or been claimed
   - Check that the secret key matches the one stored on-chain

## Monitoring and Maintenance

1. **Explorer Links**:
   - View your program on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
   - Monitor transactions for your program

2. **Update Procedures**:
   - For program updates, rebuild with `anchor build` and deploy with `anchor upgrade`
   - For frontend updates, rebuild and redeploy to your hosting service

## Security Considerations

1. **Key Management**:
   - Safeguard your program upgrade authority keypair
   - Consider using a multisig for production deployments
   
2. **QR Code Security**:
   - Implement appropriate expiration times for QR codes
   - Use secure random generation for secret keys

3. **Rate Limiting**:
   - Consider implementing rate limiting on the frontend to prevent abuse
