# cPOP ZK Compression Architecture 

## System Architecture

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────┐
│                                     │      │                                 │
│   Frontend (Next.js + React)        │      │  Solana On-Chain Programs       │
│   ┌────────────────────────────┐    │      │  ┌─────────────────────────┐    │
│   │                            │    │      │  │                         │    │
│   │   Event Creator Dashboard  │    │      │  │  cPOP Anchor Program    │    │
│   │   - Create Events          │    │      │  │  - initialize_event     │    │
│   │   - Generate QR Codes      │────┼──────┼─▶│  - generate_qr_code     │    │
│   │   - View Claims            │    │      │  │  - claim_token          │    │
│   │                            │    │      │  │  - verify_token         │    │
│   └────────────────────────────┘    │      │  │                         │    │
│                                     │      │  └─────────────┬───────────┘    │
│   ┌────────────────────────────┐    │      │                │                │
│   │                            │    │      │  ┌─────────────▼───────────┐    │
│   │   Attendee Interface       │    │      │  │                         │    │
│   │   - Scan QR Codes          │    │      │  │  SPL Account Compression│    │
│   │   - Claim Tokens           │────┼──────┼─▶│  - init_empty_merkle_   │    │
│   │   - View Claimed Tokens    │    │      │  │    tree                 │    │
│   │                            │    │      │  │  - append_leaf          │    │
│   └────────────────────────────┘    │      │  │  - verify_leaf          │    │
│                                     │      │  │                         │    │
└─────────────────────────────────────┘      │  └─────────────┬───────────┘    │
                                             │                │                │
┌─────────────────────────────────────┐      │  ┌─────────────▼───────────┐    │
│                                     │      │  │                         │    │
│   Database (PostgreSQL)             │      │  │  SPL No-Op Program      │    │
│   ┌────────────────────────────┐    │      │  │  - Used for emitting    │    │
│   │                            │    │      │  │    compression events   │    │
│   │   Events                   │    │      │  │    as CPI instruction   │    │
│   │   - metadata               │    │      │  │    data                 │    │
│   │   - Merkle tree info       │    │      │  │                         │    │
│   │                            │    │      │  └─────────────────────────┘    │
│   └────────────────────────────┘    │      │                                 │
│                                     │      └─────────────────────────────────┘
│   ┌────────────────────────────┐    │
│   │                            │    │      ┌─────────────────────────────────┐
│   │   QR Codes                 │    │      │                                 │
│   │   - event association      │    │      │   Merkle Tree Data Structure    │
│   │   - secret keys            │    │      │   ┌─────────────────────────┐   │
│   │   - expiration             │    │      │   │                         │   │
│   │                            │    │      │   │     Root Node           │   │
│   └────────────────────────────┘    │      │   │         │               │   │
│                                     │      │   │     ┌───┴────┐           │   │
│   ┌────────────────────────────┐    │      │   │     │        │           │   │
│   │                            │    │      │   │  Node A    Node B        │   │
│   │   Claimed Tokens           │    │      │   │   │ │       │ │          │   │
│   │   - leaf hash              │    │      │   │ ┌─┴─┴─┐   ┌─┴─┴─┐        │   │
│   │   - claim info             │    │      │   │ │     │   │     │        │   │
│   │                            │    │      │   │Leaf1 Leaf2 Leaf3 Leaf4   │   │
│   └────────────────────────────┘    │      │   │                         │   │
│                                     │      │   └─────────────────────────┘   │
└─────────────────────────────────────┘      │                                 │
                                             └─────────────────────────────────┘
```

## Component Flow

### Event Creation Process
1. **Event Creator** logs into the dashboard 
2. Creator fills out event details and submits creation form
3. Frontend sends request to tRPC API endpoint
4. API creates database entry for the event
5. Client-side code creates a new Merkle tree account
6. Client-side code sends transaction to initialize the event on-chain
7. On-chain `initialize_event` function:
   - Initializes event data
   - Makes CPI call to SPL Account Compression's `init_empty_merkle_tree`
   - Stores Merkle tree account address in event data
8. Database record is updated with on-chain details

### QR Code Generation Process
1. **Event Creator** selects an event and generates QR code
2. Frontend sends request to tRPC API endpoint
3. API generates random secret key and creates QR code entry
4. Client-side code sends transaction to generate QR code on-chain  
5. On-chain `generate_qr_code` function:
   - Creates a QR code account with expiration time
   - Links it to the event
6. QR code data (including secret key) is returned to frontend
7. Frontend generates and displays QR code image

### Token Claim Process
1. **Attendee** scans QR code using the app
2. Frontend decodes QR code and extracts event ID, QR code ID, and secret key
3. Frontend sends claim request to tRPC API endpoint
4. API validates the QR code hasn't been used and isn't expired
5. Client-side code sends transaction to claim token on-chain
6. On-chain `claim_token` function:
   - Verifies QR code validity
   - Creates token data (event, claimer, token ID, claim time)
   - Hashes token data using Poseidon hasher
   - Makes CPI call to SPL Account Compression's `append_leaf` 
   - Updates claimed count on event
   - Marks QR code as claimed
7. Database records are updated with claim information

### Token Verification Process
1. **Attendee or Verifier** requests to verify a token
2. Client-side code retrieves Merkle proof for the token
3. Client-side code sends transaction to verify token on-chain
4. On-chain `verify_token` function:
   - Makes CPI call to SPL Account Compression's `verify_leaf`
   - Validates the Merkle proof against the stored root
   - Returns verification result

## ZK Compression Integration

The cPOP system leverages Solana's State Compression and ZK proofs via the SPL Account Compression program to efficiently store token data on-chain:

1. **Space Efficiency**: Instead of creating separate token mint accounts for each token, all token data is stored as leaves in a Merkle tree, with only the root stored on-chain.

2. **Concurrent Updates**: The Concurrent Merkle Tree implementation allows multiple users to claim tokens simultaneously without conflicts.

3. **Proof Verification**: The system uses ZK proofs to verify token ownership without exposing the full token data.

4. **Scalability**: The system can handle millions of tokens with minimal on-chain storage cost, making it ideal for large-scale events.

## Data Structure

### On-Chain Accounts
- **Event Account** (PDA): Stores event metadata and Merkle root
- **QR Code Account** (PDA): Stores QR code data and claim status
- **Merkle Tree Account**: Stores the actual Merkle tree data structure

### Merkle Tree Leaf Structure
```
TokenData {
  event: Pubkey,     // The event's public key
  claimer: Pubkey,   // Claimer's wallet address
  token_id: u64,     // Unique token identifier
  claim_time: i64,   // Unix timestamp of claim
}
```

The leaf node in the Merkle tree is created by hashing this TokenData structure using Poseidon hashing.

## Security Features

1. **Double-Claim Prevention**: QR codes can only be claimed once, and the system tracks claimed tokens in both the database and on-chain.

2. **Expiration Time**: QR codes can have an expiration time, after which they become invalid.

3. **Secret Keys**: Each QR code has a unique secret key that must be presented during claiming.

4. **Merkle Proof Verification**: Token ownership is verified using cryptographic proofs.

## Frontend-Blockchain Communication

### Compression Utility Module

The frontend interacts with the SPL Account Compression program through a dedicated utility module (`compression.ts`):

```typescript
// Example of the utility functions for compression operations

// Create a Merkle tree account
export async function createMerkleTreeAccount(
  wallet: WalletContextState,
  connection: Connection
): Promise<Keypair> {
  const treeKeypair = Keypair.generate();
  const space = getConcurrentMerkleTreeAccountSize(MAX_DEPTH, MAX_BUFFER_SIZE, CANOPY_DEPTH);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey!,
    newAccountPubkey: treeKeypair.publicKey,
    lamports,
    space,
    programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  });
  
  const tx = new Transaction().add(createAccountIx);
  await wallet.sendTransaction(tx, connection, { signers: [treeKeypair] });
  
  return treeKeypair;
}

// Claim a token and append to Merkle tree
export async function claimToken(
  wallet: { publicKey: PublicKey; signTransaction: SignerWalletAdapter["signTransaction"] },
  eventPDA: PublicKey,
  merkleTreeAddress: PublicKey,
  creatorAddress: PublicKey,
  qrCodeId: string,
  secretKey: Uint8Array
): Promise<string> {
  // Setup Anchor program
  // Prepare the claim_token instruction
  // Send and confirm transaction
  // Return the transaction signature
}

// Generate a Merkle proof for verification
export async function generateMerkleProof(
  connection: Connection,
  merkleTreeAddress: PublicKey,
  leafIndex: number
): Promise<{ proof: AccountMeta[]; root: Buffer }> {
  // Fetch the Merkle tree account
  // Extract the relevant nodes for the proof
  // Return the proof and current root
}
```

## Future Extensions

The cPOP architecture supports several potential extensions:

1. **Multi-Chain Support**: Expand to other EVM-compatible chains using similar compression techniques.

2. **Enhanced Token Metadata**: Add support for richer token metadata including images and interactive elements.

3. **Token Transferability**: Implement optional token transfer capabilities while maintaining compression benefits.

4. **Revocation Mechanism**: Add ability for event organizers to revoke tokens in specific circumstances.

5. **Composable Proofs**: Enable tokens to be used as credentials for accessing other services or events.

5. **Authority Checks**: Only the event creator can generate QR codes or update event details.
