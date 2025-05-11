/**
 * @file referral-qrcode.ts
 * @description Utility functions for generating and processing referral QR codes
 * This file provides specialized functions for creating, formatting, and validating 
 * referral QR codes used in the Droploop referral system.
 */

import QRCode from 'qrcode';
import { PublicKey } from '@solana/web3.js';

/**
 * Generate a unique referral code for a specific referrer and campaign
 * 
 * @param referrerPublicKey The public key of the referrer
 * @param campaignId The ID of the referral campaign
 * @returns A unique referral code
 */
export function generateReferralCode(referrerPublicKey: PublicKey, campaignId: PublicKey): string {
  // Generate a unique code based on the referrer's public key and campaign ID
  // Format: ref_{first8CharsOfReferrer}_{last8CharsOfCampaign}_{randomChars}
  const referrerKey = referrerPublicKey.toString();
  const campaignKey = campaignId.toString();
  
  const prefix = 'ref';
  const referrerPart = referrerKey.slice(0, 8);
  const campaignPart = campaignKey.slice(-8);
  const randomPart = Math.random().toString(36).substring(2, 8);
  
  return `${prefix}_${referrerPart}_${campaignPart}_${randomPart}`;
}

/**
 * Create a URL that includes the referral information
 * 
 * @param referralCode The unique referral code
 * @param campaignName The name of the campaign (for display purposes)
 * @param campaignId The public key of the campaign
 * @returns A URL that can be used to claim the referral
 */
export function createReferralUrl(
  referralCode: string, 
  campaignName: string, 
  campaignId: PublicKey
): string {
  // Create a claim URL with the referral code and campaign info
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/claim` 
    : 'https://droploop.app/claim';
    
  const params = new URLSearchParams({
    campaign: encodeURIComponent(campaignName),
    id: campaignId.toString(),
    code: referralCode,
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a QR code data URL for a referral
 * 
 * @param referralUrl The URL that contains the referral information
 * @returns A Promise that resolves to a data URL for the QR code
 */
export async function generateReferralQRCode(referralUrl: string): Promise<string> {
  try {
    // Generate a QR code with the referral URL
    const qrOptions = {
      errorCorrectionLevel: 'H' as const, // High error correction for better readability
      type: 'image/png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };
    
    return await QRCode.toDataURL(referralUrl, qrOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a Solana Pay compatible QR code for referrals
 * This creates a QR code that can be scanned by Solana Pay compatible wallets
 * 
 * @param referralCode The unique referral code
 * @param campaignId The public key of the campaign
 * @param memo Optional memo to include in the transaction
 * @returns A Promise that resolves to a data URL for the Solana Pay QR code
 */
export async function generateSolanaPayReferralQR(
  referralCode: string,
  campaignId: PublicKey,
  memo?: string
): Promise<string> {
  try {
    // Solana Pay URL format
    // solana:<recipient>?amount=<amount>&spl-token=<token>&reference=<reference>&label=<label>&message=<message>&memo=<memo>
    const recipient = new PublicKey('Droploopoooooooooooooooooooooooooooooooooooo'); // Program address
    
    const params = new URLSearchParams();
    params.append('reference', campaignId.toString());
    params.append('label', 'Droploop Referral');
    params.append('message', `Join via referral code: ${referralCode}`);
    
    if (memo) {
      params.append('memo', memo);
    }
    
    const solanaPayUrl = `solana:${recipient.toString()}?${params.toString()}`;
    
    // Generate QR code
    const qrOptions = {
      errorCorrectionLevel: 'H' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#512DA8', // Purple color for Droploop branding
        light: '#FFFFFF',
      },
    };
    
    return await QRCode.toDataURL(solanaPayUrl, qrOptions);
  } catch (error) {
    console.error('Error generating Solana Pay QR code:', error);
    throw new Error('Failed to generate Solana Pay QR code');
  }
}

/**
 * Parse a referral code from a URL or QR code data
 * 
 * @param data The data from the QR code or URL
 * @returns An object containing the parsed referral information, or null if invalid
 */
export function parseReferralData(data: string): { 
  referralCode: string;
  campaignId?: string;
  campaignName?: string;
} | null {
  try {
    if (data.startsWith('solana:')) {
      // Parse Solana Pay URL
      const [prefix, paramsString] = data.split('?');
      const params = new URLSearchParams(paramsString);
      const message = params.get('message') || '';
      const referenceParam = params.get('reference');
      
      // Extract referral code from message
      const codeMatch = message.match(/code:\s*([a-zA-Z0-9_]+)/);
      if (!codeMatch) return null;
      
      return {
        referralCode: codeMatch[1],
        campaignId: referenceParam || undefined,
      };
    } else if (data.startsWith('http')) {
      // Parse Web URL
      const url = new URL(data);
      const params = url.searchParams;
      
      const code = params.get('code');
      if (!code) return null;
      
      return {
        referralCode: code,
        campaignId: params.get('id') || undefined,
        campaignName: params.get('campaign') 
          ? decodeURIComponent(params.get('campaign') as string) 
          : undefined,
      };
    } else if (data.startsWith('ref_')) {
      // Direct referral code
      return {
        referralCode: data,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing referral data:', error);
    return null;
  }
}

/**
 * Validate if a referral code is properly formatted
 * 
 * @param referralCode The referral code to validate
 * @returns True if the code is valid, false otherwise
 */
export function validateReferralCode(referralCode: string): boolean {
  // Check if the code matches our expected format
  const referralPattern = /^ref_[a-zA-Z0-9]{8}_[a-zA-Z0-9]{8}_[a-zA-Z0-9]{6}$/;
  return referralPattern.test(referralCode);
}
