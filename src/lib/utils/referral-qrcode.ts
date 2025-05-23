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
    console.log('Parsing referral data:', data);

    // Check if the data is empty
    if (!data || data.trim() === '') {
      console.log('Empty data provided to parseReferralData');
      return null;
    }

    // Handle Solana Pay URL format
    if (data.startsWith('solana:')) {
      try {
        // Parse Solana Pay URL
        const [prefix, paramsString] = data.split('?');

        if (!paramsString) {
          console.log('No parameters in Solana Pay URL');
          return null;
        }

        const params = new URLSearchParams(paramsString);
        const message = params.get('message') || '';
        const referenceParam = params.get('reference');

        // Extract referral code from message
        // Look for both formats: "code: ABC123" and "referral code: ABC123"
        const codeMatch = message.match(/(?:referral\s+)?code:\s*([a-zA-Z0-9_-]+)/i);
        if (!codeMatch) {
          console.log('No referral code found in Solana Pay message:', message);
          return null;
        }

        return {
          referralCode: codeMatch[1],
          campaignId: referenceParam || undefined,
        };
      } catch (err) {
        console.error('Error parsing Solana Pay URL:', err);
        return null;
      }
    }
    // Handle web URL format
    else if (data.startsWith('http')) {
      try {
        // Parse Web URL
        const url = new URL(data);
        const params = url.searchParams;

        // Get parameters - check multiple possible parameter names
        const code = params.get('code') || params.get('ref') || params.get('referral');
        if (!code) {
          console.log('No code parameter in URL');
          return null;
        }

        // Get campaign ID from 'id', 'mint', or 'campaign_id' parameter
        const campaignId = params.get('id') || params.get('mint') || params.get('campaign_id');

        // Get campaign name from 'campaign', 'event', or 'name' parameter
        const campaignParam = params.get('campaign') || params.get('event') || params.get('name');
        const campaignName = campaignParam ? decodeURIComponent(campaignParam) : undefined;

        return {
          referralCode: code,
          campaignId: campaignId || undefined,
          campaignName,
        };
      } catch (urlError) {
        console.error('Error parsing URL:', urlError);

        // The URL might contain a valid referral code directly, try extracting it
        const referralPattern = /\b(ref_[a-zA-Z0-9_-]+)\b/;
        const match = data.match(referralPattern);
        if (match) {
          console.log('Found referral code in URL text:', match[1]);
          return {
            referralCode: match[1],
          };
        }

        return null;
      }
    }
    // Handle direct referral code format (starts with ref_)
    else if (data.startsWith('ref_')) {
      return {
        referralCode: data,
      };
    }
    // Check for base58 public key format (might be a direct mint address)
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(data)) {
      try {
        // Validate as a public key
        new PublicKey(data);
        console.log('Data appears to be a valid Solana address');

        // Return it as a referral code (the claim form will interpret it correctly)
        return {
          referralCode: data,
          campaignId: data // The address itself might be the campaign/mint ID
        };
      } catch (err) {
        console.log('Not a valid Solana public key');
        return null;
      }
    }

    // If the data doesn't match any known format, see if it contains a referral code pattern
    const referralPattern = /\b(ref_[a-zA-Z0-9_-]+)\b/;
    const match = data.match(referralPattern);
    if (match) {
      console.log('Found referral code in text:', match[1]);
      return {
        referralCode: match[1],
      };
    }

    // If we get here, the data might be an arbitrary code or text
    // As a last resort, just pass it through as a referral code if it's not too long
    if (data.length < 100) {
      console.log('Using data as direct referral code:', data);
      return {
        referralCode: data,
      };
    }

    console.log('Data did not match any known format and is too long for a direct code');
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
  // First check the standard format
  const standardFormat = /^ref_[a-zA-Z0-9]{8}_[a-zA-Z0-9]{8}_[a-zA-Z0-9]{6}$/;
  if (standardFormat.test(referralCode)) {
    return true;
  }

  // If it's not in standard format, check if it might be a Solana address
  try {
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(referralCode)) {
      new PublicKey(referralCode); // Will throw if invalid
      return true;
    }
  } catch {
    // Not a valid public key
  }

  // For backward compatibility, we'll also accept any string starting with ref_
  if (referralCode.startsWith('ref_')) {
    return true;
  }

  // Otherwise, it's not a valid referral code
  return false;
}
