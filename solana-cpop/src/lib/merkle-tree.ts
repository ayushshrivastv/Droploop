/**
 * Custom Merkle Tree implementation for Solana ZK Compression
 * This replaces the dependency on @solana/merkle-tree
 */

import { Buffer } from 'buffer';

// Simple implementation of the Poseidon hasher for TypeScript
// In production, you would use a proper cryptographic library
export class PoseidonHasher {
  // Simulate Poseidon hashing with SHA-256 for development purposes
  // In production, this would be replaced with actual Poseidon implementation
  hash(data: Uint8Array): Uint8Array {
    // This is a placeholder implementation
    // In production, use a proper Poseidon implementation
    console.warn('Using placeholder hash function - NOT FOR PRODUCTION');
    
    // Create a deterministic hash from the data
    // This is NOT a secure implementation, just for development
    let hash = new Uint8Array(32);
    
    // Simple hashing algorithm for demonstration
    for (let i = 0; i < data.length; i++) {
      const index = i % 32;
      const hashValue = hash[index] || 0;
      const dataValue = data[i] || 0;
      hash[index] = (hashValue + dataValue) % 256;
    }
    
    return hash;
  }
  
  // Hash two child nodes to produce a parent node
  hashNodes(left: Uint8Array, right: Uint8Array): Uint8Array {
    if (!left || !right) {
      throw new Error('Cannot hash undefined nodes');
    }
    const combined = new Uint8Array(left.length + right.length);
    combined.set(left, 0);
    combined.set(right, left.length);
    return this.hash(combined);
  }
}

// Simple Merkle Tree implementation
export class MerkleTree {
  private leaves: Uint8Array[];
  private hasher: PoseidonHasher;
  private _root: Uint8Array | null;
  
  constructor(hasher = new PoseidonHasher()) {
    this.leaves = [];
    this.hasher = hasher;
    this._root = null;
  }
  
  // Add a new leaf to the tree
  addLeaf(leaf: Uint8Array): number {
    this.leaves.push(leaf);
    this._root = null; // Invalidate cached root
    return this.leaves.length - 1; // Return leaf index
  }
  
  // Get the root of the tree
  get root(): Uint8Array {
    if (!this._root) {
      this._root = this.calculateRoot();
    }
    return this._root;
  }
  
  // Calculate the root of the tree
  private calculateRoot(): Uint8Array {
    if (this.leaves.length === 0) {
      return new Uint8Array(32); // Empty tree has zero hash
    }
    
    if (this.leaves.length === 1) {
      const leaf = this.leaves[0];
      if (!leaf) {
        throw new Error('Single leaf is undefined');
      }
      return leaf; // Single leaf is the root
    }
    
    // Create a copy of the leaves as the current layer
    let currentLayer = [...this.leaves];
    
    // Continue until we reach the root
    while (currentLayer.length > 1) {
      const nextLayer: Uint8Array[] = [];
      
      // Process pairs of nodes
      for (let i = 0; i < currentLayer.length; i += 2) {
        const leftNode = currentLayer[i];
        if (!leftNode) {
          throw new Error(`Node at index ${i} is undefined`);
        }
        
        // If this is the last node and doesn't have a pair, promote it to the next layer
        if (i + 1 === currentLayer.length) {
          nextLayer.push(leftNode);
        } else {
          const rightNode = currentLayer[i + 1];
          if (!rightNode) {
            throw new Error(`Node at index ${i + 1} is undefined`);
          }
          
          // Hash the pair of nodes
          const combined = this.hasher.hashNodes(leftNode, rightNode);
          nextLayer.push(combined);
        }
      }
      
      // Move to the next layer
      currentLayer = nextLayer;
    }
    
    // The last remaining node is the root
    const rootNode = currentLayer[0];
    if (!rootNode) {
      throw new Error('Root node is undefined');
    }
    return rootNode;
  }
  
  // Generate a proof for a specific leaf
  getProof(index: number): Uint8Array[] {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Leaf index ${index} out of bounds`);
    }
    
    const proof: Uint8Array[] = [];
    let currentIndex = index;
    
    // Create a copy of the leaves as the current layer
    let currentLayer = [...this.leaves];
    
    // Continue until we reach the root
    while (currentLayer.length > 1) {
      const nextLayer: Uint8Array[] = [];
      
      // Process pairs of nodes
      for (let i = 0; i < currentLayer.length; i += 2) {
        const leftNode = currentLayer[i];
        if (!leftNode) {
          throw new Error(`Node at index ${i} is undefined`);
        }
        
        if (i === currentIndex) {
          // This is our node, add its sibling to the proof if it exists
          if (i + 1 < currentLayer.length) {
            const siblingNode = currentLayer[i + 1];
            if (!siblingNode) {
              throw new Error(`Sibling node at index ${i + 1} is undefined`);
            }
            proof.push(siblingNode);
          }
          // Calculate parent index in the next layer
          currentIndex = Math.floor(i / 2);
        } else if (i + 1 === currentIndex) {
          // Our node is the right sibling, add the left sibling to the proof
          proof.push(leftNode);
          // Calculate parent index in the next layer
          currentIndex = Math.floor(i / 2);
        }
        
        // Calculate parent node for the next layer
        if (i + 1 === currentLayer.length) {
          nextLayer.push(leftNode);
        } else {
          const rightNode = currentLayer[i + 1];
          if (!rightNode) {
            throw new Error(`Node at index ${i + 1} is undefined`);
          }
          const combined = this.hasher.hashNodes(leftNode, rightNode);
          nextLayer.push(combined);
        }
      }
      
      // Move to the next layer
      currentLayer = nextLayer;
    }
    
    return proof;
  }
  
  // Verify a proof for a specific leaf
  verifyProof(leaf: Uint8Array, proof: Uint8Array[], root: Uint8Array): boolean {
    if (!leaf || !root) {
      throw new Error('Leaf or root is undefined');
    }
    
    let current = leaf;
    
    // Apply each proof element
    for (const proofElement of proof) {
      if (!proofElement) {
        throw new Error('Proof element is undefined');
      }
      
      // Determine order of hashing (we don't have path information, so we try both)
      const left = this.hasher.hashNodes(current, proofElement);
      const right = this.hasher.hashNodes(proofElement, current);
      
      // Compare with known order (if available) or try both
      // For simplicity in this example, we're trying both orders
      // In a real implementation, you would have path information
      if (Buffer.from(left).equals(Buffer.from(root))) {
        return true;
      }
      if (Buffer.from(right).equals(Buffer.from(root))) {
        return true;
      }
      
      // If we're not at the root yet, continue with one option
      // This is simplified and may not work for all cases
      current = left;
    }
    
    // Check if we reached the root
    return Buffer.from(current).equals(Buffer.from(root));
  }
}

// Helper utility functions
export function bufferToArray(buffer: Buffer): number[] {
  return Array.from(buffer);
}

export function arrayToBuffer(array: number[]): Buffer {
  return Buffer.from(array);
}
