/**
 * Utility functions for Merkle tree operations
 */

/**
 * Calculates the space needed for a concurrent Merkle tree account
 * This is a simple estimation for development purposes
 * In production, use the actual getConcurrentMerkleTreeAccountSize from @solana/spl-account-compression
 */
export function calculateMerkleTreeSpace(
  maxDepth: number,
  maxBufferSize: number,
  canopyDepth: number = 0
): number {
  // Base size for the Merkle tree
  const baseSize = 40;
  
  // Size of each node (32 bytes for the hash)
  const nodeSize = 32;
  
  // Calculate the number of nodes in the tree
  const nodesAtMaxDepth = 2 ** maxDepth;
  
  // Calculate space for the tree structure
  const treeSpace = baseSize + nodeSize * (nodesAtMaxDepth * 2 - 1);
  
  // Buffer size for concurrent operations
  const bufferSpace = maxBufferSize * 32;
  
  // Canopy size if used
  const canopySize = canopyDepth > 0 
    ? (2 ** canopyDepth - 1) * nodeSize
    : 0;
  
  // Add some padding for metadata
  const padding = 1024;
  
  return treeSpace + bufferSpace + canopySize + padding;
}
