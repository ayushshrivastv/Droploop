# Scalable cToken Troubleshooting Guide

This guide provides a comprehensive approach to troubleshooting token creation issues in the Scalable cToken application, which uses Light Protocol for compressed token operations on Solana.

## Quick Start

If you're experiencing token creation failures, run these scripts in order:

```bash
# 1. Apply all fixes automatically (recommended)
node scripts/fix-token-creation.js

# 2. Test token creation directly
node scripts/test-token-creation.js

# 3. Start the application with the fixes applied
npm run dev
# or
bun run dev
```

## Common Error Messages and Solutions

### "Token creation failed: This may be due to an invalid admin keypair or insufficient funds."

**Possible Causes:**
- Admin private key is missing or invalid in `.env` file
- Admin wallet has insufficient SOL for transaction fees
- RPC endpoint doesn't support all required Light Protocol methods

**Solutions:**
- Run `node scripts/fix-token-creation.js` to automatically fix these issues
- Ensure admin wallet has at least 3 SOL (run `node scripts/fund-admin-wallet.js`)
- Check that you're using Helius RPC endpoint (run `node scripts/update-rpc-endpoint.js`)

### "Transaction simulation failed: Transaction results in an account with insufficient funds for rent."

**Possible Causes:**
- Admin wallet doesn't have enough SOL to cover rent-exempt minimum
- Rent calculation doesn't include enough safety margin

**Solutions:**
- Ensure admin wallet has at least 3 SOL
- Verify rent calculation includes a 50% safety margin
- Our fixes update this automatically in the code

### "Transaction signature verification failure"

**Possible Causes:**
- Admin keypair is not being parsed correctly
- Transaction isn't being signed with the correct keypair

**Solutions:**
- Run `node scripts/fix-token-creation.js` to fix keypair parsing
- Check `.env` file for proper base64-encoded private key
- Verify the admin is set as the mint authority

### "failed to get slot: Method not found"

**Possible Causes:**
- RPC endpoint doesn't support Light Protocol methods
- Using default Solana RPC endpoint instead of Helius

**Solution:**
- Run `node scripts/update-rpc-endpoint.js` to switch to Helius RPC endpoint
- Update `.env` file to use `https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff`

## Step-by-Step Troubleshooting

### 1. Verify Environment Configuration

Check your `.env` file has the correct configuration:

```
NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff
ADMIN_PRIVATE_KEY=<base64-encoded-private-key>
```

### 2. Verify Admin Wallet Balance

The admin wallet needs sufficient SOL for transaction fees:

```bash
# Check admin public key
node scripts/derive-public-key.js

# Fund admin wallet
node scripts/fund-admin-wallet.js

# Or use online faucets:
# - https://faucet.solana.com/
# - https://solfaucet.com/
```

### 3. Test Token Creation Directly

Bypass the UI to test token creation directly:

```bash
node scripts/test-token-creation.js
```

This will:
- Parse the admin keypair from `.env`
- Create a connection to Solana with the proper RPC endpoint
- Create a compressed token mint
- Mint tokens to a test wallet
- Report detailed results and any errors

### 4. Check Server Logs

When creating tokens through the UI, check both:
- Browser console logs (F12 in most browsers)
- Server-side logs (in your terminal running the dev server)

Look for specific error messages from Light Protocol or Solana.

### 5. Validate Metadata URI

Ensure you're using a proper JSON metadata URI:
- Should point to a JSON file (not a direct image link)
- JSON should follow the [Metaplex NFT Standard](https://docs.metaplex.com/programs/token-metadata/token-standard)
- For testing, use a known-good URI like:
  - `https://arweave.net/TCefB73555sZDrqmX7Y59cUS43h3WQXMZ54u1DK3W8A`

## Advanced Troubleshooting

### Manually Checking Transaction Status

If you have a transaction signature, check its status:

```bash
solana confirm -v <SIGNATURE> --url https://api.devnet.solana.com
```

Or visit Solana Explorer: https://explorer.solana.com/tx/[SIGNATURE]?cluster=devnet

### Examining Light Protocol State Trees

Check active state trees for compression:

```bash
curl -X POST https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getCachedActiveStateTreeInfos","params":[]}'
```

### Testing RPC Endpoint Support

Verify your RPC endpoint supports all necessary methods:

```bash
curl -X POST https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getActiveStateTreeInfos","params":[]}'
```

## Fix Scripts Reference

This project includes several utility scripts to help troubleshoot and fix token creation issues:

| Script | Purpose |
|--------|---------|
| `scripts/fix-token-creation.js` | Comprehensive fix for all token creation issues |
| `scripts/setup-admin-wallet.js` | Generate new admin keypair and configure `.env` |
| `scripts/fund-admin-wallet.js` | Request SOL airdrops for the admin wallet |
| `scripts/update-rpc-endpoint.js` | Switch to Helius RPC endpoint |
| `scripts/derive-public-key.js` | Extract admin public key from private key |
| `scripts/test-token-creation.js` | Directly test token creation functionality |

## Additional Resources

- [Light Protocol Documentation](https://lightprotocol.com/docs)
- [Solana Compressed NFTs](https://solana.com/developers/guides/compressed-nfts)
- [Helius RPC Documentation](https://docs.helius.dev/compression-and-das-api/compression-api)

## Getting Help

If you're still experiencing issues after following this guide:

1. Check detailed logs using these commands:
   ```bash
   # Enable verbose logging
   export RUST_LOG=debug
   # Start with extra debugging
   npm run dev -- --debug
   ```

2. Create a detailed report with:
   - Full error messages and stack traces
   - Transaction signatures if available
   - Environment details (Node.js version, Solana CLI version)
   - Steps to reproduce the issue

3. Consider alternative RPC providers if Helius is having issues:
   - [QuickNode](https://www.quicknode.com/)
   - [Triton](https://triton.one/)
   - [Alchemy](https://www.alchemy.com/)
