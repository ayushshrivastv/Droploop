import 'dotenv/config';
import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram } from '@lightprotocol/compressed-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

async function testLightProtocol() {
  try {
    console.log('🧪 Testing Light Protocol Integration');
    
    // Check environment variables
    const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    const CLUSTER = process.env.NEXT_PUBLIC_CLUSTER || 'devnet';
    
    console.log(`🔗 Using RPC endpoint: ${RPC_ENDPOINT}`);
    console.log(`🌐 Using cluster: ${CLUSTER}`);
    
    // Parse admin private key
    if (!process.env.ADMIN_PRIVATE_KEY) {
      throw new Error('❌ ADMIN_PRIVATE_KEY is missing in .env file');
    }
    
    const secretKey = new Uint8Array(JSON.parse(process.env.ADMIN_PRIVATE_KEY));
    const adminKeypair = Keypair.fromSecretKey(secretKey);
    const publicKeyBase58 = adminKeypair.publicKey.toString();
    // Only show a masked version of the public key for security
    const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
    console.log(`👤 Admin wallet: ${maskedKey}`);
    
    // Test Light Protocol's RPC connection
    console.log('🔄 Creating Light Protocol RPC connection...');
    let rpc;
    try {
      // Create the Light Protocol RPC connection
      rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT);
      console.log('✅ Light Protocol RPC connection created successfully');
      
      // Test a basic RPC method
      console.log('🔍 Testing basic RPC methods...');
      const version = await rpc.getVersion();
      console.log('✅ RPC version:', version);
      
      // Check admin account on Light Protocol
      console.log('💰 Checking admin account balance...');
      const balance = await rpc.getBalance(adminKeypair.publicKey);
      console.log(`✅ Admin balance: ${balance / LAMPORTS_PER_SOL} SOL`);
      
      // Test specific Light Protocol methods needed for compressed tokens
      console.log('🧪 Testing Light Protocol specific methods...');
      
      // Test 1: Check if getIndexerSlot method exists (this is the method that was failing)
      console.log('🔍 Testing getIndexerSlot method...');
      try {
        if (typeof rpc.getIndexerSlot === 'function') {
          console.log('✅ getIndexerSlot method exists');
          try {
            const slot = await rpc.getIndexerSlot();
            console.log('✅ getIndexerSlot returned:', slot);
          } catch (slotError) {
            console.error('❌ Error calling getIndexerSlot:', slotError.message);
          }
        } else {
          console.error('❌ getIndexerSlot method does not exist on the RPC object');
        }
      } catch (error) {
        console.error('❌ Error testing getIndexerSlot:', error.message);
      }
      
      // Test 2: Check CompressedTokenProgram availability
      console.log('🔍 Testing CompressedTokenProgram...');
      try {
        if (CompressedTokenProgram) {
          console.log('✅ CompressedTokenProgram is available');
          // Check if the createMint method exists
          if (typeof CompressedTokenProgram.createMint === 'function') {
            console.log('✅ CompressedTokenProgram.createMint method exists');
          } else {
            console.error('❌ CompressedTokenProgram.createMint method does not exist');
          }
        } else {
          console.error('❌ CompressedTokenProgram is not available');
        }
      } catch (error) {
        console.error('❌ Error testing CompressedTokenProgram:', error.message);
      }
      
      // Test 3: Check if the RPC endpoint supports Light Protocol's compression methods
      console.log('🔍 Testing RPC endpoint support for Light Protocol...');
      try {
        // Try to get the latest block hash (this should work on any Solana RPC)
        const blockHash = await rpc.getLatestBlockhash();
        console.log('✅ getLatestBlockhash successful:', blockHash.blockhash.substring(0, 10) + '...');
        
        // Try to get the tree config (this is specific to Light Protocol)
        if (typeof rpc.getTreeConfig === 'function') {
          console.log('✅ getTreeConfig method exists');
        } else {
          console.warn('⚠️ getTreeConfig method does not exist - this might indicate the RPC endpoint does not fully support Light Protocol');
        }
      } catch (error) {
        console.error('❌ Error testing RPC endpoint support:', error.message);
      }
      
      console.log('\n🎉 Light Protocol integration test completed');
      console.log('📋 Summary:');
      console.log('- RPC Connection: ✅');
      console.log('- Basic RPC Methods: ✅');
      console.log('- Admin Account: ✅');
      console.log('- Light Protocol Methods: ' + (typeof rpc.getIndexerSlot === 'function' ? '✅' : '❌'));
      console.log('- CompressedTokenProgram: ' + (CompressedTokenProgram ? '✅' : '❌'));
      
    } catch (error) {
      console.error('❌ Error connecting to Light Protocol:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testLightProtocol();
