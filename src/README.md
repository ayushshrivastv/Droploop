# Droploop - Technical Documentation

## Project Architecture

This project is built using Next.js 15 with the App Router architecture, React 18, and integrates with Solana blockchain via wallet adapters and Light Protocol for compressed token functionality to power the referral system.

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── claim/            # Referral reward claiming page
│   ├── mint/             # Referral program creation page
│   ├── profile/          # User profile page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Homepage
├── components/           # React components
│   ├── claim/            # Claim-related components
│   ├── layouts/          # Layout components
│   ├── mint/             # Referral program creation components
│   ├── providers/        # Context providers
│   ├── shared/           # Shared components (header, footer)
│   └── ui/               # UI components (buttons, forms, etc.)
├── hooks/                # Custom React hooks
└── lib/                  # Utilities and constants
    ├── utils/            # Utility functions
    ├── constants.ts      # Application constants
    └── types.ts          # TypeScript type definitions
```

## Core Functionality

### Referral Program Creation

The referral program creation flow uses Light Protocol's compressed token standard to create cost-effective referral tokens on Solana:

1. Business/creator connects their Solana wallet via the wallet adapter
2. Creator fills out referral program details in the creation form
3. Application creates compressed referral tokens using Light Protocol's SDK
4. QR codes are generated for referral distribution using Solana Pay URLs

### Referral Reward Claiming

The referral claiming process works as follows:

1. User scans a referral QR code or enters a referral code
2. Application validates the referral code against the blockchain
3. User connects their wallet to receive the referral reward
4. Referral token is transferred to the user's wallet using compressed token transfer functions

## Technical Implementation Details

### Wallet Integration

The application uses Solana wallet adapters to connect to various Solana wallets. The wallet connection is managed through the `WalletProvider` component, which wraps the application and provides wallet context to all components.

### Compressed Tokens

Light Protocol's state compression technology is used to create and transfer tokens at a fraction of the cost of traditional Solana tokens. This works by:

- Storing token data in a Merkle tree
- Using zero-knowledge proofs for verification
- Reducing on-chain storage requirements

### UI Framework

The UI is built with:

- Tailwind CSS for styling
- shadcn/ui for component primitives
- Responsive design principles for mobile compatibility
- Dark/light mode support via next-themes

## Scalability Highlights

- **Massive Throughput**: Capable of supporting referral programs with 10,000+ participants through Light Protocol's compressed tokens
- **Cost Efficiency**: 99.9% reduction in transaction costs compared to traditional tokens (approximately 0.000005 SOL per referral vs 0.005 SOL)
- **Network Efficiency**: Reduces on-chain storage requirements by up to 1000x while maintaining full L1 security guarantees
- **Batch Processing**: Optimized for high-volume referral processing with minimal network congestion

### Compression Technology

At the core of our solution is Light Protocol's compression technology:

- **Zero-Knowledge Proofs**: Enables efficient on-chain storage while preserving cryptographic verification
- **Merkle Tree Implementation**: Organizes referral token data in compressed Merkle trees, allowing thousands of referrals to be represented by a single on-chain commitment
- **Concurrent Processing**: Supports parallel referral reward distribution without chain congestion
- **Verifiable Ownership**: Despite compression, referral rewards maintain full verifiability and composability with other Solana protocols

### Performance Optimizations

- Server components are used where possible to reduce client-side JavaScript
- Images and assets are optimized for fast loading
- API routes are implemented for server-side operations
- Client-side caching for blockchain data

## Security Considerations

- Wallet connections use standard Solana wallet adapter security practices
- No private keys are stored in the application
- All blockchain transactions require explicit user approval
- Input validation is implemented for all user inputs

## Deployment Architecture

The application is deployed on Vercel with:

- Edge functions for API routes
- Automatic HTTPS and SSL
- Environment variables for configuration
- Connection to Solana devnet (configurable to mainnet)
