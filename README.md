# Droploop: Decentralized Referral System

Droploop enables creators to build decentralized referral campaigns that reward users for inviting others to join their community. Through unique QR codes and referral links, users can easily share and track their referrals, with rewards automatically distributed as compressed tokens on the Solana blockchain.

Built for the 1000x Hackathon - Best cToken integration for Solana Pay Bounty, this application demonstrates how referral programs can leverage blockchain technology for transparency, cost-effectiveness, and scalability without compromising on user experience.

**[Droploop Project](https://droploop-ten.vercel.app)**

![Screenshot 2025-05-12 at 12 41 15 PM](https://github.com/user-attachments/assets/f4ecd134-a0d5-4b0a-96f9-e1f41a5b6e26)

## Referral System Workflow

Droploop uses Light Protocol's ZK Compression to make referral campaigns cost-effective and scalable. When a creator starts a campaign, they generate unique referral codes that can be shared via QR codes. When someone joins through a referral, the smart contract verifies the legitimacy of the referral and rewards both the referrer and the new user with compressed tokens. All transactions are securely recorded on the Solana blockchain with ZK Compression, making the entire process 1000x more affordable than traditional methods.

For a detailed presentation of the Droploop referral system, including features, benefits, and technical details, please see our [presentation document](./presentation.md).

## Functionality

Creators can connect their Solana wallet, initiate a referral campaign, and set the reward parameters for both referrers and new joiners. Upon creation, the system generates unique referral QR codes and links that can be distributed across various channels. Users can join through these referrals and earn rewards in the form of compressed tokens. All campaign statistics are tracked in real-time, giving creators full visibility into their referral program's performance.

## Solana Pay and Smart Contract Workflow

A decentralized referral system built on Solana using ZK Compression with Light Protocol

A powerful and cost effective solution for creating and managing referral campaigns on the Solana blockchain through compressed tokens and the power of ZK compression technology.

![Screenshot 2025-05-11 at 7 02 48 AM](https://github.com/user-attachments/assets/c4ae4a28-b219-458c-a0dc-ae11823205a7)

![Screenshot 2025-05-11 at 7 03 21 AM](https://github.com/user-attachments/assets/ea0aba20-76e3-4031-96ec-5f6b7b80c64d)

![Screenshot 2025-05-12 at 12 39 55 PM](https://github.com/user-attachments/assets/6d551ee3-e33b-4f4f-98c6-559d296e5852)

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

For more in-depth technical details, refer to the [ARCHITECTURE.md](https://github.com/ayushshrivastv/Droploop/blob/main/ARCHITECTURE.md) file.

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

## Setup and Installation

### Prerequisites

- Node.js 18+
- Rust and Cargo
- Solana CLI tools
- Anchor framework

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ZK-Compression-cPOP-Interface.git
cd ZK-Compression-cPOP-Interface
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd solana-cpop
npm install

# Install Anchor program dependencies
cd anchor-program
npm install
```

3. Configure environment variables:
```bash
# Create a .env.local file in the solana-cpop directory with:
cp .env.example .env.local
```

### Local Development

1. Start the Next.js development server:
```bash
cd solana-cpop
npm run dev
```

2. Build and deploy the Anchor program (requires Solana CLI and Anchor):
```bash
cd anchor-program
anchor build
anchor deploy --provider.cluster devnet
```

## Technical Implementation

### Smart Contracts

The Anchor program provides the following functions:

- `initialize_event`: Creates a new event with a Merkle tree for token management
- `generate_qr_code`: Generates a unique QR code for token claiming
- `claim_token`: Claims a token by scanning a QR code and appends to the Merkle tree
- `verify_token`: Verifies token ownership using Merkle proofs

### Frontend

The Next.js frontend provides:

- Event creation and management dashboard
- QR code generation and display
- Token claiming interface
- Verification tools

### Database Schema

- Events: Stores event details and Merkle tree information
- QR Codes: Manages QR code data including secret keys and expiration times
- Tokens: Tracks claimed tokens and associated metadata

## Security Considerations

- QR codes include unique secret keys and expiration times
- Anti-double-claim mechanisms to prevent duplicate token claims
- Wallet-based authentication for event creation and management
- Rate limiting to prevent abuse

## Project Status

This project was developed as part of the ZK Compression Track by Solana Foundation, Helius, and Light Protocol. It demonstrates the practical application of compressed accounts for NFT-like use cases.

## License

This project is licensed under the MIT License and is open for extension, experimentation, and contribution [MIT](LICENSE).

