/**
 * Custom Merkle Tree implementation for Solana ZK Compression
 * This replaces the dependency on @solana/merkle-tree
 */

import { Buffer } from 'buffer';
import { keccak_256 } from 'js-sha3';

// Poseidon hasher implementation
// NOTE: This is a simplified implementation using Keccak-256 as a placeholder for Poseidon
// In production, this should be replaced with a proper Poseidon implementation from a library like:
// - @noble/hashes or
// - circomlibjs (which supports Poseidon hashing)
export class PoseidonHasher {
  // Hash input data using Keccak-256 as a placeholder for Poseidon
  hash(data: Uint8Array): Uint8Array {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using Keccak-256 as placeholder for Poseidon hash - NOT FOR PRODUCTION');
    }
    
    // Use Keccak-256 for development
    const hash = keccak_256.create();
    hash.update(Buffer.from(data));
    return new Uint8Array(hash.digest());
  }
  
  // Hash two child nodes to produce a parent node
  hashNodes(left: Uint8Array, right: Uint8Array): Uint8Array {
    if (!left || !right) {
      throw new Error('Cannot hash undefined nodes');
    }
    
    // Ensure both nodes are of the same length (32 bytes each)
    if (left.length !== 32 || right.length !== 32) {
      throw new Error(`Invalid node length: left=${left.length}, right=${right.length}, expected=32`);
    }
    
    // For Poseidon-based Merkle trees, we would normally just poseidon([left, right])
    // But since we're using Keccak as a placeholder, we concatenate and hash:
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
  private layers: Uint8Array[][];
  
  constructor(hasher = new PoseidonHasher()) {
    this.leaves = [];
    this.hasher = hasher;
    this._root = null;
    this.layers = [];
  }
  
  // Add a new leaf to the tree
  addLeaf(leaf: Uint8Array): number {
    if (leaf.length !== 32) {
      throw new Error(`Invalid leaf length: ${leaf.length}, expected=32`);
    }
    
    this.leaves.push(leaf);
    this._root = null; // Invalidate cached root
    this.layers = []; // Invalidate cached layers
    return this.leaves.length - 1; // Return leaf index
  }
  
  // Get the root of the tree
  get root(): Uint8Array {
    if (!this._root) {
      this.calculateLayers();
      if (this.layers.length > 0) {
        const [rootLayer] = this.layers.slice(-1);
        this._root = rootLayer[0];
      } else {
        // Empty tree has a null root (represented as zeros)
        this._root = new Uint8Array(32);
      }
    }
    return this._root;
  }
  
  // Calculate all layers of the tree
  private calculateLayers(): void {
    if (this.leaves.length === 0) {
      this.layers = [];
      return;
    }
    
    // Start with the leaves as the bottom layer
    this.layers = [Array.from(this.leaves)];
    
    // Continue building layers until we reach the root
    while (this.layers[this.layers.length - 1].length > 1) {
      this.layers.push(this.getNextLayer(this.layers[this.layers.length - 1]));
    }
  }
  
  // Calculate the next layer in the tree
  private getNextLayer(currentLayer: Uint8Array[]): Uint8Array[] {
    const nextLayer: Uint8Array[] = [];
    
    // Process pairs of nodes
    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        // Hash the pair together
        nextLayer.push(this.hasher.hashNodes(currentLayer[i], currentLayer[i + 1]));
      } else {
        // If there's an odd number of nodes, the last one is promoted to the next layer
        nextLayer.push(currentLayer[i]);
      }
    }
    
    return nextLayer;
  }
  
  // Generate a proof for a specific leaf
  getProof(index: number): Uint8Array[] {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Leaf index ${index} out of bounds`);
    }
    
    // Ensure layers are calculated
    this.calculateLayers();
    
    // Build the proof from bottom to top
    const proof: Uint8Array[] = [];
    let currentIndex = index;
    
    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const currentLayer = this.layers[layerIndex];
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      
      // Add sibling to proof if it exists
      if (siblingIndex < currentLayer.length) {
        proof.push(currentLayer[siblingIndex]);
      }
      
      // Move to parent index in the next layer
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }
  
  // Verify a proof for a specific leaf
  verifyProof(leaf: Uint8Array, proof: Uint8Array[], targetRoot: Uint8Array): boolean {
    if (!leaf || !targetRoot) {
      throw new Error('Leaf or root is undefined');
    }
    
    if (leaf.length !== 32 || targetRoot.length !== 32) {
      throw new Error(`Invalid length: leaf=${leaf.length}, root=${targetRoot.length}, expected=32`);
    }
    
    // Start with the leaf
    let computedNode = leaf;
    
    // Process each element in the proof
    for (let i = 0; i < proof.length; i++) {
      const proofElement = proof[i];
      if (!proofElement || proofElement.length !== 32) {
        throw new Error(`Invalid proof element at index ${i}: length=${proofElement?.length}, expected=32`);
      }
      
      // In a real implementation, we'd know whether each proof element is a left or right sibling
      // Since we don't have that info here, we can use the index to determine the position
      // If we know the path information from the index, we can use:
      const isRight = ((i + 1) & 1) === 1;
      
      if (isRight) {
        // proofElement is the right sibling, so hash(computedNode || proofElement)
        computedNode = this.hasher.hashNodes(computedNode, proofElement);
      } else {
        // proofElement is the left sibling, so hash(proofElement || computedNode)
        computedNode = this.hasher.hashNodes(proofElement, computedNode);
      }
    }
    
    // Check if our computed root matches the target root
    return Buffer.from(computedNode).equals(Buffer.from(targetRoot));
  }
}

// Helper utility functions
export function bufferToArray(buffer: Buffer): number[] {
  return Array.from(buffer);
}

export function arrayToBuffer(array: number[]): Buffer {
  return Buffer.from(array);
}
