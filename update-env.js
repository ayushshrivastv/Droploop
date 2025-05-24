const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.join(__dirname, '.env');

// New private key (generated in previous step)
const newPrivateKey = '0Kvh6ccQb4OTcRHhQk1uM2ugg9D0eiP0tZVVBLf6tqeCxjcVjotsevV7db1+W7zP2cOzveX3wU7thkwesn9nTg==';

try {
  // Read the current .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the ADMIN_PRIVATE_KEY line with the new key
  // This regex will match the ADMIN_PRIVATE_KEY line regardless of what's after the equals sign
  const updatedContent = envContent.replace(
    /ADMIN_PRIVATE_KEY=.*/,
    `ADMIN_PRIVATE_KEY=${newPrivateKey}`
  );
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, updatedContent);
  
  console.log('✅ Successfully updated ADMIN_PRIVATE_KEY in .env file');
  console.log('New admin public key: 9oVJb1Q9bTzkitsu5yNCwWVPESf3H98WdzbKvRUJVj3b');
  console.log('\n⚠️ IMPORTANT: The new admin wallet has 0 SOL. You need to fund it before using it.');
} catch (error) {
  console.error('❌ Error updating .env file:', error);
}
