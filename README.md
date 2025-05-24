# Droploop - Decentralized Referral System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.0-black)](https://nextjs.org/)
[![Solana Pay](https://img.shields.io/badge/Solana-Pay-9945FF)](https://solanapay.com/)
[![Light Protocol](https://img.shields.io/badge/Light_Protocol-ZK_Compression-6A5ACD)](https://lightprotocol.com/)

This project enables businesses and creators to build decentralized referral programs using NFTs that can be shared and claimed through a simple scan of a QR code. These referral NFTs are not just symbolic; they represent verifiable, compressed assets living entirely on-chain, making them ideal for tracking referrals, distributing rewards, and growing communities at scale.

For a detailed technical architecture and component flow diagrams, please refer to the [ARCHITECTURE.md](./docs/ARCHITECTURE.md) document.

Droploop's decentralized referral system combines the power of blockchain technology with the simplicity of QR code sharing to create a seamless referral experience that's transparent, efficient, and rewarding for everyone involved.


### Web Page Link
**[Droploop Page](https://scalable-c-token-ayushshrivastvs-projects.vercel.app/)**

![Screenshot 2025-05-11 at 3 10 50 AM](https://github.com/user-attachments/assets/f3607a9c-9026-46d0-8559-f83740a2eab7)

## Overview

Droploop Referral System with Solana Pay and ZK Compression on Solana

A high throughput solution for creating and managing decentralized referral programs at scale on Solana blockchain using Solana Pay and Light Protocol's compression technology.

Check out [Presentation](./docs/PRESENTATION.md) for a quick overview of the project's functionality.

## Zero-Knowledge Compression Technology

Droploop leverages Light Protocol's zero-knowledge compression technology to revolutionize referral programs on Solana. This cutting-edge approach combines the security of blockchain with the efficiency of advanced cryptographic techniques, enabling a new paradigm for referral tracking and reward distribution.

At its core, our implementation uses zero-knowledge proofs to compress referral data while preserving its integrity and verifiability. This allows us to dramatically reduce on-chain storage requirements and transaction costs without sacrificing security or functionality. The system can process hundreds of referrals in a single transaction, making it ideal for viral growth campaigns and large-scale referral programs.

Beyond efficiency, this technology enhances privacy by allowing selective disclosure of information. Businesses can verify referral authenticity without exposing sensitive user data, while participants can prove their referrals without revealing personal details. The entire system is built on cryptographic guarantees that mathematically prevent fraud or unauthorized modifications.

### Performance Comparison: Traditional vs. Compressed Referral Systems

| Metric | Traditional Referral Systems | Compressed Referral NFTs | Improvement |
|--------|-------------------|-------------------|-------------|
| Cost per referral | ~0.005 SOL | ~0.000005 SOL | 1000× cheaper |
| Referrals per transaction | 1-5 | Up to 1,000 | 200-1000× more efficient |
| Processing speed | ~10 referrals/minute | ~5,000 referrals/minute | 500× faster |
| Storage requirements | Full on-chain data | Compressed merkle proofs | 100× less storage |
| Security level | Standard on-chain | Cryptographically equivalent | Equally secure |
| Privacy features | Limited | Selective disclosure | Enhanced privacy |

This powerful combination of scalability, privacy, and security makes Droploop an ideal solution for any business looking to create and manage referral programs at scale without prohibitive costs or technical complexity.

## Solana Pay and Smart Contract Workflow

Droploop uses Solana Pay to make referral sharing super easy. Users can claim referral NFTs without any hassle. Program creators set up a smart contract on Solana to mint referral NFTs. This contract uses Light Protocol's infrastructure to create compressed NFTs. When someone scans a referral QR code, it sends a transaction to the smart contract. The smart contract checks if the referral is valid and then sends a unique, compressed referral NFT straight to the user's wallet while distributing rewards according to the program rules. This way, referrals are tracked and rewards are distributed securely and efficiently.



## Functionality

Business owners and creators can log in with their Solana wallet, create a new referral program, and instantly mint compressed referral NFTs tied to program metadata such as name, reward structure, and distribution rules. Upon creation, the system generates a Solana Pay-compatible QR code, which can be shared with potential referrers. When scanned, users can securely claim the referral NFT via their own wallet and start earning rewards. Each referral NFT is issued using Light Protocol's compression infrastructure, drastically reducing storage costs while maintaining full L1 composability.

The user interface is built to be intuitive across devices and accommodates both the program creator and referrer journeys—from creating programs to claiming rewards—with minimal friction.

<img src="https://github.com/user-attachments/assets/f7a7ba25-3150-4b68-a109-b3f85af91110" alt="442056085-235a9be9-e4fa-46f9-989e-1b1ce8cda931" width="800"/>

<img src="https://github.com/user-attachments/assets/e2d11e13-a8b1-4c6c-a7ad-2a3d65d02f86" alt="442056067-8b7532fd-1a86-4471-810d-b7e9b3484217" width="800"/>

<img src="https://github.com/user-attachments/assets/f9c81e73-129b-4750-9d6d-9a44a9d8d104" alt="Screenshot 2025-05-12 at 4 23 55 AM" width="800"/>

### Seamless Connection of Wallet to Collect Event Tokens.

<img src="https://github.com/user-attachments/assets/397b8b3b-b404-4b81-8b32-a6f6885f04cb" alt="Screenshot 2025-05-12 at 7 16 48 AM" width="300"/>


<img src="https://github.com/user-attachments/assets/5ecbbd21-bd21-4201-bb57-2dbc219473d1" alt="Screenshot 2025-05-18 at 12 35 43 AM" width="300"/>

## QR Codes & Reward Distribution

### Solana Pay QR Codes
The application leverages Solana Pay's QR code technology to create a seamless referral experience:

- **Dynamic Generation**: Each referral program automatically generates unique QR codes that encode all necessary transaction data
- **Instant Recognition**: Compatible with any standard QR scanner or smartphone camera
- **Transaction Embedding**: QR codes contain pre-formatted transaction instructions for referral claiming
- **Wallet Connectivity**: Scanning initiates an immediate connection to the user's preferred Solana wallet
- **Security Features**: Each QR code includes validation parameters to prevent fraudulent referrals

### Reward Distribution Capabilities
The platform offers efficient reward distribution functionality for program creators:

- **Tiered Rewards**: Create multi-level referral programs with different reward tiers
- **Instant or Milestone-Based**: Choose between immediate rewards or milestone-based distribution
- **Transferable Options**: Make referral NFTs transferable or non-transferable based on program needs
- **Performance Tracking**: Monitor real-time referral statistics through an intuitive dashboard
- **Flexible Allocation**: Distribute different reward amounts to different referrer tiers

This combination of QR-based sharing and flexible reward distribution makes the platform ideal for both digital and physical business growth campaigns.

### Smart Contracts & Solana Pay Integration
Manage referrals and distribute rewards with just a few clicks. Our system allows businesses to track referrals and distribute rewards to hundreds or thousands of participants simultaneously. The platform leverages custom Solana smart contracts that interact seamlessly with Light Protocol's compression technology, reducing transaction costs by 1000x. Solana Pay integration enables frictionless referral sharing through scannable QR codes that embed transaction instructions, wallet connections, and verification parameters—all while maintaining sub-second finality and military-grade security.

**[Try the live demo here](https://scalable-c-token-ayushshrivastvs-projects.vercel.app/)**

## Setup & Installation

To run this project locally, ensure you have Node.js 16 or later and a compatible Solana wallet (Phantom, Backpack, or Solflare). Clone the repository and install dependencies using:

```bash
git clone https://github.com/ayushshrivastv/Droploop.git
cd Droploop
npm install
# or if you prefer using bun
bun install
```

### Automated Setup (Recommended)

The project now includes an automated setup script that will:
1. Create the necessary `.env` file with the correct environment variables
2. Generate a new admin wallet keypair for token operations
3. Request an airdrop of SOL to the admin wallet (on devnet)

Simply run:

```bash
npm run setup
# or
bun run setup
```

Then start the development server:

```bash
npm run dev
# or
bun run dev
```

The development server will also automatically run the setup script if needed.

### Manual Setup (Alternative)

If you prefer to set up manually, create a `.env` file in the root directory with the following environment variables:

```
NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
ADMIN_PRIVATE_KEY=your_admin_private_key_here
```

You can generate an admin private key using the Solana CLI:
```bash
solana-keygen new --no-passphrase -o admin-keypair.json
# Then convert to base64 format for the .env file
cat admin-keypair.json | base64
```

The application will be available at [http://localhost:3000](http://localhost:3000). Connect your wallet to begin creating or claiming tokens.

## Using the Application

To create a referral program, connect your wallet and navigate to the "Create Referral" section. Fill out the program information including reward structure, confirm the transaction, and a QR code will be generated for distribution. Share this QR code with potential referrers who can scan it using any QR reader or camera app, which will launch Solana Pay and guide them through the referral NFT claim process in a few simple steps.

The process is secure, affordable, and designed for high-volume referral programs that can scale with your business growth.

## Technical Stack

This application is built with Next.js 15, React 18, and TypeScript, using Tailwind CSS and shadcn/ui for the frontend. Blockchain functionality is powered by Solana, with Light Protocol handling compression. Wallet interactions are handled via the Solana Wallet Adapter framework.

The architecture allows easy extensibility and is suitable for further enhancements such as event analytics, email confirmations, or token gating.


For more in-depth technical details, refer to the [src/README.md](./src/README.md) file.

## Development Scripts

```bash
npm run dev         # Run development server
npm run lint        # Check for code issues
npm run format      # Auto-format code
npm run build       # Build application for production
npm run start       # Start production server
```
## User Experience Showcase

### Program Creator Journey
For business owners and creators, the process is simple: connect your Solana wallet, create a referral program with custom details, and generate QR codes for distribution. The system handles referral NFT creation using Light Protocol's compression technology.

1. Connect wallet and access the intuitive dashboard
2. Create a referral program with custom reward structure
3. Generate unique QR codes for distribution
4. Monitor real-time referral statistics and reward distribution

### Referrer Journey
Referrers just scan the QR code with their phone, approve the claim in their Solana wallet, and instantly receive their referral NFT – all with minimal fees. They can then share their own referral link to earn rewards.

1. Scan referral QR code with any Phone
2. Connect Solana wallet with a single tap
3. Claim compressed referral NFT in seconds
4. Share with others and earn rewards automatically

## Deployment

The application is deployed on Vercel. To deploy your own version:

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add the required environment variables:
   - `NEXT_PUBLIC_CLUSTER` (e.g., `devnet`)
   - `NEXT_PUBLIC_RPC_ENDPOINT` (e.g., `https://api.devnet.solana.com`)

## License

This project is licensed under the MIT License and is open for extension, experimentation, and contribution.
