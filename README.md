# Droploop: Decentralized Referral System

A decentralized referral system built on Solana using ZK Compression with Light Protocol

A powerful and cost-effective solution for creating and managing referral campaigns on the Solana blockchain through compressed tokens and the power of ZK compression technology.

**[Droploop Project](https://github.com/ayushshrivastv/Droploop)**

![Screenshot 2025-05-11 at 3 10 50 AM](https://github.com/user-attachments/assets/f3607a9c-9026-46d0-8559-f83740a2eab7)

## Overview

Droploop enables creators to build decentralized referral campaigns that reward users for inviting others to join their community. Through unique QR codes and referral links, users can easily share and track their referrals, with rewards automatically distributed as compressed tokens on the Solana blockchain.

Built for the Best cPOP Interface track of the 1000x Hackathon, this application demonstrates how referral programs can leverage blockchain technology for transparency, cost-effectiveness, and scalability without compromising on user experience.

## Referral System Workflow

Droploop uses Light Protocol's ZK Compression to make referral campaigns cost-effective and scalable. When a creator starts a campaign, they generate unique referral codes that can be shared via QR codes. When someone joins through a referral, the smart contract verifies the legitimacy of the referral and rewards both the referrer and the new user with compressed tokens. All transactions are securely recorded on the Solana blockchain with ZK Compression, making the entire process 1000x more affordable than traditional methods.

## Functionality

Creators can connect their Solana wallet, initiate a referral campaign, and set the reward parameters for both referrers and new joiners. Upon creation, the system generates unique referral QR codes and links that can be distributed across various channels. Users can join through these referrals and earn rewards in the form of compressed tokens. All campaign statistics are tracked in real-time, giving creators full visibility into their referral program's performance.

## Solana Pay and Smart Contract Workflow

![442056085-235a9be9-e4fa-46f9-989e-1b1ce8cda931](https://github.com/user-attachments/assets/f7a7ba25-3150-4b68-a109-b3f85af91110)

![442056067-8b7532fd-1a86-4471-810d-b7e9b3484217](https://github.com/user-attachments/assets/e2d11e13-a8b1-4c6c-a7ad-2a3d65d02f86)

![442056106-0c9807e2-f345-4c51-b399-fb8932c9bcb1](https://github.com/user-attachments/assets/ed907b7b-4264-41ea-a7c4-5e3010d846fe)

## Referral System & Rewards

### QR Code Referrals
The application leverages QR code technology to create a seamless referral experience:

- **Unique Generation**: Each campaign participant receives personalized QR codes for tracking their referrals
- **Instant Recognition**: Compatible with any standard QR scanner or smartphone camera
- **Referral Embedding**: QR codes contain all necessary referral data for attribution
- **Wallet Connectivity**: Scanning initiates an immediate connection to the user's preferred Solana wallet
- **Security Features**: Each QR code includes validation parameters to prevent fraudulent claims

### Reward Distribution
The platform offers efficient reward distribution for referral campaigns:

- **Dual Rewards**: Both referrers and new joiners receive compressed tokens as rewards
- **Automatic Transfers**: Rewards are automatically distributed upon successful referral verification
- **Real-time Tracking**: All referrals and rewards are tracked in a comprehensive dashboard
- **Conversion Analytics**: Monitor conversion rates and campaign performance metrics
- **Flexible Reward Structure**: Configure different reward tiers based on referral volume or user type

This combination of QR-based referrals and automatic reward distribution makes the platform ideal for growing communities and incentivizing user acquisition.

**[Explore the GitHub repository](https://github.com/ayushshrivastv/Droploop)**

## Setup & Installation

To run this project locally, ensure you have Node.js 16 or later and a compatible Solana wallet (Phantom, Backpack, or Solflare). Clone the repository and install dependencies using:

```bash
git clone https://github.com/ayushshrivastv/Droploop.git
cd Droploop
npm install
```

Create a `.env.local` file in the root directory with the following environment variables:

```
NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

Then start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000). Connect your wallet to begin creating or claiming tokens.

## Using the Application

To create a referral campaign, connect your wallet and navigate to the "Create Campaign" section. Set up your campaign parameters, including reward amounts for referrers and new joiners. Once created, you'll receive unique referral codes and QR codes to share. Users can join through these referrals by scanning the QR code or entering the referral code, connecting their wallet, and receiving their reward tokens automatically.

The entire process is secure, affordable, and designed for high-volume referral campaigns with minimal overhead.

## Technical Stack

This application is built with Next.js 15, React 18, and TypeScript, using Tailwind CSS and shadcn/ui for the frontend. Blockchain functionality is powered by Solana, with Light Protocol handling ZK Compression for tokens. Wallet interactions are handled via the Solana Wallet Adapter framework.

The architecture is designed for easy extensibility and is suitable for further enhancements such as advanced analytics, multi-tier referral programs, or custom reward structures.

## Quantified Benefits

| Metric | Traditional Referral Programs | Droploop | Improvement |
|--------|---------------------------|-----------------|-------------|
| Storage Cost per Referral | ~0.005 SOL | ~0.000005 SOL | 1000x reduction |
| Referrals per Transaction | 1 | Up to 1,000 | 1000x throughput |
| Gas Fees for 10,000 Referrals | ~50 SOL | ~0.05 SOL | 1000x savings |
| Referral Verification Time | 2-5 seconds | 2-5 seconds | Equal UX |
| Maximum Campaign Size | ~1,000 participants | 100,000+ participants | 100x scalability |

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

### Creator Journey
1. Connect wallet and access the intuitive dashboard
2. Create a referral campaign with custom reward parameters
3. Generate and share unique referral QR codes
4. Monitor real-time referral statistics

### Referrer Journey
1. Join a campaign and receive a personalized referral code
2. Share referral QR code with potential new users
3. Track referral conversions in profile dashboard
4. Receive compressed token rewards automatically

### New User Journey
1. Scan referral QR code or enter referral code
2. Connect Solana wallet with a simple click
3. Join the campaign and receive welcome rewards
4. Get your own referral code to continue the chain

## Deployment

The application is deployed on Vercel. To deploy your own version:

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add the required environment variables:
   - `NEXT_PUBLIC_CLUSTER` (e.g., `devnet`)
   - `NEXT_PUBLIC_RPC_ENDPOINT` (e.g., `https://api.devnet.solana.com`)

## License

This project is licensed under the MIT License and is open for extension, experimentation, and contribution.

## Special Thanks

Gratitude to the teams behind Light Protocol and Solana for their exceptional infrastructure and tools. Additional thanks to the developers of Next.js, the creators of shadcn/ui, and the broader Solana community for their ongoing support and innovation.

---

Crafted with care by Ayush Srivastava

*Submission for the 1000x Hackathon - Best cPOP Interface Track*
