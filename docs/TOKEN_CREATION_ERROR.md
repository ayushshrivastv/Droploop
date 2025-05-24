# Token Creation Error Documentation

## Error Message
```
Token creation failed: This may be due to an invalid admin keypair or insufficient funds. Please check your environment variables and wallet balance.
```

## Console Error
```
Error: This may be due to an invalid admin keypair or insufficient funds. Please check your environment variables and wallet balance.

src/components/mint/mint-form.tsx (189:17) @ onSubmit

  187 |         // Check if the request was successful
  188 |         if (!response.ok) {
> 189 |           throw new Error(result.details || result.error || 'Token creation failed');
      |                 ^
  190 |         }
  191 |         
  192 |         console.log("Server-side token creation successful:", result);
```

## Root Cause
The error occurs because:
1. The application requires an admin keypair stored in the `ADMIN_PRIVATE_KEY` environment variable
2. This keypair is used for creating and minting compressed tokens
3. Either the environment variable is missing/invalid, or the wallet has insufficient SOL for transaction fees

## Solution

### 1. Create a proper `.env` file
Create a `.env` file in the project root with the following variables:
```
NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
ADMIN_PRIVATE_KEY=your_admin_private_key_here
```

### 2. Generate a valid admin keypair
You can generate a new keypair using the Solana CLI or Node.js:
```bash
# Using Solana CLI
solana-keygen new --no-passphrase -o admin-keypair.json
# Then extract the private key in base64 format
cat admin-keypair.json | base64

# Or using Node.js
node -e "const crypto = require('crypto'); const secretKey = crypto.randomBytes(32); console.log('Private Key (base64):', secretKey.toString('base64'));"
```

### 3. Fund the admin wallet
The admin wallet needs SOL to pay for transaction fees:
```bash
# Using Solana CLI (replace with your public key)
solana airdrop 1 YOUR_PUBLIC_KEY --url https://api.devnet.solana.com
```

### 4. Restart the application
After setting up the environment variables and funding the wallet, restart the application to apply the changes.

## Verification
To verify the admin wallet has been properly configured and funded:
1. Check the wallet balance using the Solana CLI or a block explorer
2. Look for successful log messages in the console when creating tokens
3. Ensure the token creation process completes without errors
