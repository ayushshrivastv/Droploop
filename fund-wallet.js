const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// New admin wallet public key
const newAdminPublicKey = '9oVJb1Q9bTzkitsu5yNCwWVPESf3H98WdzbKvRUJVj3b';

// Create a connection to the devnet cluster
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function requestAirdrop() {
  try {
    console.log('Requesting airdrop for new admin wallet...');
    
    // Request 2 SOL airdrop (2 billion lamports)
    const signature = await connection.requestAirdrop(
      new PublicKey(newAdminPublicKey),
      2 * LAMPORTS_PER_SOL
    );
    
    console.log('Airdrop requested, waiting for confirmation...');
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    // Check the balance
    const balance = await connection.getBalance(new PublicKey(newAdminPublicKey));
    
    console.log(`✅ Airdrop successful!`);
    console.log(`New admin wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    console.error('❌ Error requesting airdrop:', error);
  }
}

requestAirdrop();
