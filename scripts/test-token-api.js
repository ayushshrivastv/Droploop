/**
 * Script to test the token creation API directly
 * This checks if our error handling for insufficient admin wallet balance works
 */

const fetch = require('node-fetch');

async function testTokenCreationAPI() {
  console.log('🧪 Testing token creation API...');

  try {
    // Sample token creation data
    const mintData = {
      name: 'Test Token',
      symbol: 'TEST',
      supply: 1000000000, // 1000 tokens with 6 decimals
      decimals: 6,
      tokenMetadata: {
        name: 'Test Token',
        symbol: 'TEST',
        image: 'https://arweave.net/123',
      }
    };

    // Sample destination wallet (can be any valid Solana address)
    const destinationWallet = 'BH2qFQAG4m8v38he2hbdZLcCbRhFp1ce67yYFJapfzJU';

    console.log('📝 Sending token creation request with these parameters:');
    console.log('- Token Name:', mintData.tokenMetadata.name);
    console.log('- Token Symbol:', mintData.tokenMetadata.symbol);
    console.log('- Supply:', mintData.supply);
    console.log('- Decimals:', mintData.decimals);
    console.log('- Destination Wallet:', destinationWallet);

    // Send request to the API endpoint
    console.log('\n🔄 Sending request to API...');
    const response = await fetch('http://localhost:3000/api/token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mintData,
        destinationWallet,
      }),
    });

    // Parse the response
    const result = await response.json();

    console.log(`\n📡 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ Token creation successful!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Token creation failed!');
      console.log('Error Code:', result.code || 'No error code');
      console.log('Error Message:', result.error || 'No error message');
      console.log('Details:', result.details || 'No details');

      // Check if this is the expected insufficient funds error
      if (result.code === 'INSUFFICIENT_FUNDS') {
        console.log('\n✅ TEST PASSED: API correctly reports insufficient admin wallet funds!');
        console.log('Our error handling improvements are working as expected.');
      } else {
        console.log('\n⚠️ Unexpected error code. Expected INSUFFICIENT_FUNDS but got:', result.code);
      }
    }

  } catch (error) {
    console.error('❌ Error testing token creation API:', error.message);
  }
}

// Run the test
testTokenCreationAPI();
