# Common Token Creation Errors

This document describes common errors you might encounter when creating tokens and how to fix them.

## Insufficient Admin Wallet Funds

**Error Message:**
```
Insufficient admin wallet balance: The admin wallet needs at least 2 SOL to create tokens.
```

**Cause:**
The server-side admin wallet used for token creation doesn't have enough SOL to pay for transaction fees.

**Solution:**
1. Fund the admin wallet with SOL:
   ```bash
   # Update the admin public key in this file first
   node scripts/fund-admin-wallet.js
   ```
2. Alternatively, use an online faucet:
   - [Solana Faucet](https://faucet.solana.com)
   - [SolFaucet](https://solfaucet.com)
   - [QuickNode Faucet](https://faucet.quicknode.com/solana/devnet)

3. The admin wallet needs at least 2-3 SOL for reliable token creation.

## Insufficient Funds for Rent

**Error Message:**
```
Transaction simulation failed: Transaction results in an account with insufficient funds for rent.
```

**Cause:**
The admin wallet doesn't have enough SOL to cover the storage cost ("rent") for creating the new token mint account.

**Solution:**
1. Fund the admin wallet with at least 3 SOL
2. Verify the RPC endpoint is working correctly:
   ```bash
   node scripts/test-token-creation.js
   ```
3. The fix has already been implemented to add a 50% safety margin to rent calculations

## Signature Verification Failed

**Error Message:**
```
Transaction signature verification failure.
```

**Cause:**
The admin keypair is invalid or not being correctly parsed from the environment variable.

**Solution:**
1. Regenerate the admin keypair:
   ```bash
   node scripts/setup-admin-wallet.js
   ```
2. Verify the admin keypair is being correctly parsed:
   ```bash
   node scripts/test-token-creation.js
   ```
3. The fix has already been implemented to improve keypair parsing

## RPC Method Not Found

**Error Message:**
```
failed to get slot: Method not found
```

**Cause:**
The RPC endpoint doesn't support all the methods required by Light Protocol.

**Solution:**
1. Update to a compatible RPC endpoint:
   ```bash
   node scripts/update-rpc-endpoint.js
   ```
2. Test multiple RPC endpoints to find a working one:
   ```bash
   node scripts/test-token-creation.js
   ```
3. The fix has already been implemented to use Helius RPC endpoint with better Light Protocol support

## Invalid Metadata URI

**Error Message:**
```
Transaction simulation failed: Error processing Instruction 3
```

**Cause:**
The metadata URI is invalid or not properly formatted.

**Solution:**
1. Use a known-good Arweave JSON metadata URI:
   ```
   https://arweave.net/TCefB73555sZDrqmX7Y59cUS43h3WQXMZ54u1DK3W8A
   ```
2. Ensure metadata is a JSON file (not a direct image link)
3. The fix has already been implemented to use a standardized metadata URI

## Troubleshooting Tools

This project includes several utility scripts to help troubleshoot token creation issues:

| Script | Purpose |
|--------|---------|
| `scripts/test-token-creation.js` | Test admin keypair and RPC connection |
| `scripts/setup-admin-wallet.js` | Generate new admin keypair |
| `scripts/fund-admin-wallet.js` | Request SOL airdrops for admin wallet |
| `scripts/update-rpc-endpoint.js` | Switch to a better RPC endpoint |
| `scripts/fix-token-creation.js` | Apply all fixes automatically |

## Best Practices

1. **Always have sufficient funds:**
   - Keep at least 3 SOL in the admin wallet
   - This covers transaction fees and rent for creating new token mints

2. **Use reliable RPC endpoints:**
   - Helius RPC endpoints are recommended for Light Protocol
   - If an RPC endpoint fails, try the default `https://api.devnet.solana.com`

3. **Monitor errors in browser console:**
   - Open developer tools (F12) to see detailed error messages
   - These provide more context than the UI error messages

4. **Check logs:**
   - Backend error logs contain valuable debugging information
   - Look for "Transaction Logs" which show the actual Solana error

## Additional Resources

- [Solana Developer Documentation](https://docs.solana.com/)
- [Light Protocol Documentation](https://lightprotocol.com/docs)
- [Solana Compressed NFTs Guide](https://solana.com/developers/guides/compressed-nfts)
