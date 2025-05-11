export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">cPOP: Compressed Proof-of-Participation</h1>
      <p className="text-xl max-w-2xl mb-8">
        A platform for creating and distributing compressed token proofs of participation
        using ZK Compression on Solana.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Create Events</h2>
          <p>Create events and mint compressed tokens (cTokens) for participants</p>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Generate QR Codes</h2>
          <p>Create unique QR codes for participants to scan and claim tokens</p>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">ZK Verification</h2>
          <p>Tokens are verified using zero-knowledge proofs for maximum efficiency</p>
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">About ZK Compression</h2>
        <p className="mb-4">
          ZK Compression on Solana reduces state costs by orders of magnitude while
          preserving security, performance, and composability of the blockchain.
        </p>
        <p>
          Our platform demonstrates the power of ZK Compression by enabling scalable
          token distribution for thousands of users at minimal cost.
        </p>
      </div>
    </div>
  );
}
