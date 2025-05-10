# cToken Proof-of-Participation (cPOP) Interface with ZK Compression

A scalable solution for minting, distributing, and verifying proof-of-participation tokens on Solana using Zero-Knowledge Compression.

## Overview

The cPOP Interface enables event organizers to create and distribute proof-of-participation tokens using Solana's account compression technology. This brings several advantages:

- **Scalability**: Handle thousands of tokens with minimal on-chain footprint and cost
- **Efficiency**: Reduced transaction fees and storage requirements
- **Verifiability**: Cryptographic proof of event participation
- **User-Friendly**: QR code-based claims for seamless distribution

## Architecture

This project consists of several key components:

1. **Smart Contracts**: Anchor-based Rust programs for token management
2. **Frontend**: Next.js application for event creation and token management
3. **Compression System**: Integration with SPL Account Compression for efficient token storage
4. **API Layer**: tRPC-based API for backend-frontend communication

![Architecture Diagram](./ARCHITECTURE.md)

## ZK Compression Details

The project leverages Solana's SPL Account Compression program to store token data in Merkle trees. This approach:

- Compresses multiple token ownership records into a single Merkle tree
- Reduces storage costs by up to 99% compared to traditional SPL tokens
- Enables efficient validation using Merkle proofs
- Stores off-chain data (token metadata) while maintaining on-chain verification

Key compression programs used:
- SPL Account Compression Program: `cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK`
- SPL No-Op Program: `noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV`

## Features

- **Event Creation**: Create events with customizable token parameters
- **QR Code Generation**: Generate unique QR codes for each potential participant
- **Token Claiming**: Scan QR codes to claim compressed tokens
- **Token Verification**: Verify token ownership using zero-knowledge proofs
- **Anti-Double-Claim Protection**: Security measures to prevent duplicate claims

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

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./solana-cpop/DEPLOYMENT.md).

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

[MIT](LICENSE)

## Credits

- Solana Foundation
- Helius
- Light Protocol

---

*For technical questions or support, please open an issue on this repository.*
