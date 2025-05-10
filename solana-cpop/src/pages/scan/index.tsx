import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Box, Container, Flex, Heading, Text, useToast, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { Button, VStack, HStack, Card } from '@/components/campaign/ChakraAdapter';
import { useReferralClient } from '@/lib/referral-client';

const ScanPage: NextPage = () => {
  const wallet = useWallet();
  const router = useRouter();
  const toast = useToast();
  const referralClient = useReferralClient(wallet);
  
  const [claimingToken, setClaimingToken] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle QR code URL submission
  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeUrl || claimingToken) return;
    
    try {
      // Extract QR code ID and secret from URL
      const url = new URL(qrCodeUrl);
      const pathParts = url.pathname.split('/');
      const qrCodeId = pathParts[pathParts.length - 1];
      const secretKey = url.searchParams.get('secret');
      
      if (!qrCodeId || !secretKey) {
        throw new Error('Invalid QR code URL');
      }
      
      // Proceed with claiming
      await claimToken(qrCodeId, secretKey);
      
    } catch (error) {
      console.error('Error processing QR code URL:', error);
      toast({
        title: 'Invalid QR Code URL',
        description: 'The URL is not valid for cPOP token claiming.',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  const claimToken = async (qrCodeId: string, secretKey: string) => {
    if (!wallet.connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to claim this token.',
        status: 'warning',
        duration: 5000,
      });
      return;
    }
    
    try {
      setClaimingToken(true);
      
      // Call the API to claim the token
      const result = await referralClient.claimReferralToken(qrCodeId, secretKey);
      
      setTokenInfo({
        eventName: result.eventName || 'Event',
        tokenName: result.tokenName || 'Token',
        tokenSymbol: result.tokenSymbol || 'TKN',
      });
      
      setClaimed(true);
      toast({
        title: 'Token Claimed!',
        description: `You have successfully claimed your ${result.tokenName || 'token'}.`,
        status: 'success',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error claiming token:', error);
      toast({
        title: 'Claim Failed',
        description: error instanceof Error ? error.message : 'Something went wrong. This token might have expired or already been claimed.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setClaimingToken(false);
    }
  };
  
  const resetForm = () => {
    setClaimed(false);
    setTokenInfo(null);
    setQrCodeUrl('');
  };
  
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.includes('claim/')) {
        setQrCodeUrl(clipboardText);
      }
    } catch (err) {
      console.error('Clipboard access denied:', err);
    }
  };
  
  return (
    <>
      <Head>
        <title>Scan QR Code | cPOP Proof of Participation</title>
        <meta name="description" content="Scan a QR code to claim your proof-of-participation token" />
      </Head>
      
      <Box bg="black" minH="100vh" color="white">
        {/* Header/Navigation */}
        <Box as="nav" borderBottom="1px solid" borderColor="gray.800" py={4}>
          <Container maxW="container.xl">
            <Flex justify="space-between" align="center">
              <HStack spacing={8}>
                <Link href="/" passHref>
                  <Heading as="h1" size="md" cursor="pointer">cPOP</Heading>
                </Link>
                <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                  <Link href="/dashboard">
                    <Text color="gray.400" _hover={{ color: 'white' }}>Dashboard</Text>
                  </Link>
                  <Link href="/scan">
                    <Text fontWeight="bold" color="white">Scan QR</Text>
                  </Link>
                  <Link href="/my-tokens">
                    <Text color="gray.400" _hover={{ color: 'white' }}>My Tokens</Text>
                  </Link>
                </HStack>
              </HStack>
              
              <WalletMultiButton />
            </Flex>
          </Container>
        </Box>
        
        {/* Scanner Content */}
        <Container maxW="container.md" py={8}>
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading size="lg" mb={2}>Scan Event QR Code</Heading>
              <Text color="gray.400">Scan a QR code to claim your proof-of-participation token</Text>
            </Box>
            
            {!wallet.connected ? (
              <Card p={10} textAlign="center" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
                <VStack spacing={6}>
                  <Box bg="gray.800" p={4} borderRadius="full">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V13C21 11.8954 20.1046 11 19 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                  <Heading color="white" size="md">Connect Your Wallet</Heading>
                  <Text maxW="md" color="gray.400">You need to connect your Solana wallet to claim proof-of-participation tokens.</Text>
                  <WalletMultiButton />
                </VStack>
              </Card>
            ) : claimed ? (
              <Card p={10} textAlign="center" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
                <VStack spacing={6}>
                  <Box bg="green.800" p={4} borderRadius="full">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#68D391" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="#68D391" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                  <Heading color="white" size="md">Token Claimed Successfully!</Heading>
                  <Text color="gray.400">
                    You have successfully claimed your {tokenInfo?.tokenName || 'token'} ({tokenInfo?.tokenSymbol || 'TKN'}) 
                    from {tokenInfo?.eventName || 'the event'}.
                  </Text>
                  <HStack spacing={4} mt={4}>
                    <Button onClick={() => router.push('/my-tokens')} variant="solid">
                      View My Tokens
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      Claim Another
                    </Button>
                  </HStack>
                </VStack>
              </Card>
            ) : (
              <Card p={10} bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center">
                    <Box bg="gray.800" p={4} borderRadius="full" display="inline-flex" mb={4}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="7" y="7" width="3" height="3" rx="0.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="7" y="14" width="3" height="3" rx="0.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="14" y="7" width="3" height="3" rx="0.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="14" y="14" width="3" height="3" rx="0.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Box>
                    <Heading color="white" size="md" mb={2}>Claim Your Token</Heading>
                    <Text maxW="md" mx="auto" color="gray.400" mb={6}>
                      Paste the QR code URL to claim your proof-of-participation token.
                    </Text>
                  </Box>
                  
                  <form onSubmit={handleSubmitUrl}>
                    <FormControl mb={4}>
                      <FormLabel>QR Code Link</FormLabel>
                      <Flex>
                        <Input 
                          value={qrCodeUrl}
                          onChange={(e) => setQrCodeUrl(e.target.value)}
                          placeholder="https://example.com/claim/qr-code-id?secret=xxxxx"
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "gray.600" }}
                          flex="1"
                          mr={2}
                        />
                        <Button
                          onClick={handlePaste}
                          variant="outline"
                        >
                          Paste
                        </Button>
                      </Flex>
                    </FormControl>
                    
                    <Button 
                      type="submit" 
                      variant="solid" 
                      size="lg" 
                      width="100%"
                      isDisabled={!qrCodeUrl}
                    >
                      Claim Token
                    </Button>
                  </form>
                  
                  <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
                    Scan the QR code with your phone's camera app and paste the URL here
                  </Text>
                </VStack>
              </Card>
            )}
            
            {claimingToken && (
              <Card p={6} textAlign="center" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
                <Text>Processing your token claim...</Text>
              </Card>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default ScanPage;
