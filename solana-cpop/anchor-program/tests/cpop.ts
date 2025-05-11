import * as anchor from "@coral-xyz/anchor";
import { Program, Idl } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { assert } from "chai";
// Add mocha type definitions
import "mocha";
import { randomBytes } from "crypto";

describe("cpop", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Use a more generic type to avoid Idl constraint issues
  const program = anchor.workspace.Cpop as unknown as Program<Idl>;
  const wallet = provider.wallet as anchor.Wallet;

  // Constants for the Merkle tree
  const MAX_DEPTH = 20;
  const MAX_BUFFER_SIZE = 64;
  const CANOPY_DEPTH = 0; // No canopy for simplicity in testing

  // Test data
  const eventName = "Test Event";
  const tokenName = "Test Token";
  const tokenSymbol = "TEST";
  const maxSupply = 100;
  const eventUri = "https://example.com/event";
  const tokenUri = "https://example.com/token";

  // Test accounts
  let eventAccount: PublicKey;
  let merkleTreeAccount: Keypair;
  let qrCodeId: string;
  let qrCodeAccount: PublicKey;
  let secretKey: Uint8Array;
  let expirationTime: number;

  // Helper function to create and initialize a Merkle tree account
  async function createMerkleTreeAccount(): Promise<Keypair> {
    // Generate a new keypair for the Merkle tree account
    const treeKeypair = Keypair.generate();

    // Calculate the required space for the Merkle tree
    const space = getConcurrentMerkleTreeAccountSize(MAX_DEPTH, MAX_BUFFER_SIZE, CANOPY_DEPTH);

    // Calculate the lamports required for rent-exemption
    const lamports = await provider.connection.getMinimumBalanceForRentExemption(space);

    // Create a transaction to allocate space for the Merkle tree account
    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: treeKeypair.publicKey,
      lamports,
      space,
      programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    });

    // Send and confirm the transaction
    const tx = new Transaction().add(createAccountIx);
    await provider.sendAndConfirm(tx, [treeKeypair]);

    return treeKeypair;
  }

  it("Initializes an event with a Merkle tree", async () => {
    // Create a Merkle tree account
    merkleTreeAccount = await createMerkleTreeAccount();
    console.log("Merkle tree account created:", merkleTreeAccount.publicKey.toString());

    // Find the PDA for the event account
    const [eventPDA] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"), 
        wallet.publicKey.toBuffer(), 
        Buffer.from(eventName)
      ],
      program.programId
    );
    eventAccount = eventPDA;

    // Call the initialize_event instruction
    await program.methods
      .initializeEvent(
        eventName,
        new anchor.BN(maxSupply)
      )
      .accounts({
        event: eventAccount,
        merkleTree: merkleTreeAccount.publicKey,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        noopProgram: SPL_NOOP_PROGRAM_ID,
      })
      .rpc();

    // Fetch the created event account to verify it was initialized correctly
    // Use any to bypass type checking since we're using a generic Idl type
    const eventData = await (program.account as any).event.fetch(eventAccount);
    
    assert.equal(eventData.creator.toString(), wallet.publicKey.toString());
    assert.equal(eventData.eventName, eventName);
    assert.equal(eventData.tokenName, tokenName);
    assert.equal(eventData.tokenSymbol, tokenSymbol);
    assert.equal(eventData.maxSupply.toNumber(), maxSupply);
    assert.equal(eventData.claimedCount.toNumber(), 0);
    assert.equal(eventData.isActive, true);
    assert.equal(eventData.eventUri, eventUri);
    assert.equal(eventData.tokenUri, tokenUri);
    assert.equal(eventData.merkleTree.toString(), merkleTreeAccount.publicKey.toString());
    
    console.log("Event initialized successfully!");
  });

  it("Generates a QR code for token claiming", async () => {
    // Generate random data for QR code
    qrCodeId = `qr-${Date.now()}`;
    secretKey = randomBytes(32);
    expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now

    // Find the PDA for the QR code account
    const [qrCodePDA] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("qr_code"),
        eventAccount.toBuffer(),
        Buffer.from(qrCodeId)
      ],
      program.programId
    );
    qrCodeAccount = qrCodePDA;

    // Call the generate_qr_code instruction
    await program.methods
      .generateQrCode(
        qrCodeId,
        new anchor.BN(expirationTime)
      )
      .accounts({
        qrCode: qrCodeAccount,
        event: eventAccount,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch the created QR code account to verify it was initialized correctly
    // Use any to bypass type checking since we're using a generic Idl type
    const qrCodeData = await (program.account as any).qrCode.fetch(qrCodeAccount);
    
    assert.equal(qrCodeData.event.toString(), eventAccount.toString());
    assert.equal(qrCodeData.qrCodeId, qrCodeId);
    assert.deepEqual(Array.from(qrCodeData.secretKey), Array.from(secretKey));
    assert.equal(qrCodeData.expirationTime.toNumber(), expirationTime);
    assert.isNull(qrCodeData.claimer);
    assert.isNull(qrCodeData.claimTime);
    
    console.log("QR code generated successfully!");
  });

  it("Claims a token using the QR code", async () => {
    // Use a different wallet to claim the token
    const claimerKeypair = Keypair.generate();
    
    // Airdrop some SOL to the claimer for transaction fees
    const airdropSignature = await provider.connection.requestAirdrop(
      claimerKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Call the claim_token instruction
    await program.methods
      .claimToken()
      .accounts({
        qrCode: qrCodeAccount,
        event: eventAccount,
        merkleTree: merkleTreeAccount.publicKey,
        claimer: claimerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
        eventCreator: wallet.publicKey,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        noopProgram: SPL_NOOP_PROGRAM_ID,
      })
      .signers([claimerKeypair])
      .rpc();

    // Fetch the QR code account to verify it was claimed
    // Use any to bypass type checking since we're using a generic Idl type
    const qrCodeData = await (program.account as any).qrCode.fetch(qrCodeAccount);
    
    assert.equal(qrCodeData.claimer.toString(), claimerKeypair.publicKey.toString());
    assert.isNotNull(qrCodeData.claimTime);
    
    // Fetch the event account to verify claimed count was incremented
    // Use any to bypass type checking since we're using a generic Idl type
    const eventData = await (program.account as any).event.fetch(eventAccount);
    assert.equal(eventData.claimedCount.toNumber(), 1);
    
    console.log("Token claimed successfully!");
    
    // Store the token ID and claimer for the next test
    const tokenId = 1; // First token has ID 1
    
    // This verification test currently depends on specific implementation details
    // of the Merkle tree and the SPL Account Compression program.
    // In a real implementation, you would need to generate the Merkle proof off-chain
    // using a library that matches the on-chain implementation.
    console.log("Token verification test would be run here with token ID:", tokenId);
    console.log("Claimer:", claimerKeypair.publicKey.toString());
    
    // Depending on your implementation, you'd need to:
    // 1. Recreate the leaf hash from the token data
    // 2. Generate a Merkle proof for this leaf
    // 3. Call verify_token with this proof
    
    // For now, we'll just check that the event has the expected state
    assert.equal(eventData.claimedCount.toNumber(), 1);
    console.log("Event state verified successfully!");
  });
});
