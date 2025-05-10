# cPOP: Compressed Proof-of-Participation on Solana

A platform for creating and distributing compressed token proofs of participation using ZK Compression on Solana.

## Overview

cPOP (Compressed Proof-of-Participation) allows event organizers to create and distribute proof-of-participation tokens using Solana's ZK Compression technology. These tokens verify participation in events while significantly reducing on-chain storage costs.

Key features:
- Create events and mint compressed tokens (cTokens)
- Generate QR codes for attendees to scan
- Verify participation using zero-knowledge proofs
- Manage events and track participation
- All tokens are compressed on-chain for maximum efficiency

## Technology

This project leverages several cutting-edge technologies:

- **Solana ZK Compression**: Reduces state costs by orders of magnitude while preserving the security, performance, and composability of the Solana L1
- **Anchor Framework**: Used for smart contract development
- **Next.js**: React framework for the frontend
- **Solana Wallet Adapter**: For wallet connections
- **QR Code Generation/Scanning**: For the claim flow
- **PostgreSQL**: For storing event and participation data
- **Drizzle ORM**: For database interactions

## Project Structure

- `/src`: Next.js frontend application
  - `/app`: Routes and pages
  - `/components`: React components including QR code tools
  - `/lib`: Utility functions and Solana client code
  - `/server`: Backend API routes and database schema
- `/anchor-program`: Solana smart contract code
  - `/programs/cpop`: Main program logic for compressed tokens
- `/public`: Static assets

## Local Development

### Prerequisites

- Node.js 18+ and Bun
- Solana Tool Suite (for smart contract development)
- Anchor Framework
- PostgreSQL database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solana-cpop.git
cd solana-cpop
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start a PostgreSQL database (required for the app to function):
```bash
./start-database.sh
```

5. Run the development server:
```bash
bun run dev
```

The application will be available at http://localhost:3000.

### Smart Contract Development

The Anchor program in `/anchor-program` implements the on-chain logic for:
- Creating compressed tokens
- Generating and verifying QR codes
- Managing claims with ZK proofs

To build and test the smart contract:

```bash
cd anchor-program
anchor build
anchor test
```

To deploy to devnet:

```bash
anchor deploy --provider.cluster devnet
```

## ZK Compression Implementation

This project demonstrates the power of ZK Compression on Solana by:

1. **Compressed Data Storage**: Token metadata and ownership are stored in a compressed format using Merkle trees
2. **On-Chain Verification**: Claims are verified on-chain while keeping data size minimal
3. **Proof Generation**: Zero-knowledge proofs verify token ownership without revealing all token data
4. **Double-Claim Prevention**: The system prevents participants from claiming the same token multiple times

The compression approach reduces on-chain storage costs by up to 98% compared to traditional token approaches, making it feasible to distribute tokens to thousands of participants with minimal costs.

## Usage Flow

1. **Event Creation**:
   - Organizer creates an event and mints compressed tokens
   - System initializes a new Merkle tree for the event's tokens

2. **QR Code Generation**:
   - Organizer generates QR codes for participants
   - Each QR code contains a unique identifier and secret key

3. **Token Claiming**:
   - Participant scans QR code with the web app
   - App connects to participant's wallet
   - Smart contract verifies the QR code and claims a compressed token
   - Token is added to the event's Merkle tree

4. **Token Verification**:
   - Participant can verify ownership using a Merkle proof
   - Token ownership can be verified by third parties

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Solana Foundation
- Light Protocol for ZK Compression libraries
- Helius for infrastructure support
