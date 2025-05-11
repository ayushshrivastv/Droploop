declare module '@solana/spl-account-compression' {
  export const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID: import('@solana/web3.js').PublicKey;
  export const SPL_NOOP_PROGRAM_ID: import('@solana/web3.js').PublicKey;
  export function getConcurrentMerkleTreeAccountSize(
    maxDepth: number,
    maxBufferSize: number,
    canopyDepth?: number
  ): number;
}
