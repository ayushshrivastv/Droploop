import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Box, Container, Flex, Heading, Text, SimpleGrid, Image, Skeleton } from '@chakra-ui/react';
import { ButtonWithRef, VStack, HStack, Card } from '@/components/campaign/ChakraAdapter';
import { useReferralClient } from '@/lib/referral-client';

type Token = {
  id: string;
  eventName: string;
  tokenName: string;
  tokenSymbol: string;
  claimedAt: number;
  tokenUri: string;
  imageUrl?: string;
};

const MyTokensPage: NextPage = () => {
  const wallet = useWallet();
  const referralClient = useReferralClient(wallet);
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load user's tokens
  useEffect(() => {
    if (wallet.connected) {
      loadTokens();
    } else {
      setTokens([]);
      setLoading(false);
    }
  }, [wallet.connected]);
  
  const loadTokens = async () => {
    try {
      setLoading(true);
      // This is a mock implementation - in a real app, we would fetch tokens from the blockchain
      // In production, this would use compressed account lookups via the Solana wallet
      const userTokens = await referralClient.getMyClaimedTokens();
      
      // Add placeholder images for demo purposes
      const tokensWithImages = userTokens.map(token => ({
        ...token,
        imageUrl: token.tokenUri || getPlaceholderImage(token.id)
      }));
      
      setTokens(tokensWithImages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setLoading(false);
    }
  };
  
  // Generate a placeholder image based on token ID (for demo purposes)
  const getPlaceholderImage = (id: string) => {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#50C878', '#87CEEB'];
    const colorIndex = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return `https://via.placeholder.com/300/${colors[colorIndex].replace('#', '')}?text=${id.slice(0, 4)}`;
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  return (
    <>
      <Head>
        <title>My Tokens | cPOP Proof of Participation</title>
        <meta name="description" content="View your claimed proof-of-participation tokens" />
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
                    <Text color="gray.400" _hover={{ color: 'white' }}>Scan QR</Text>
                  </Link>
                  <Link href="/my-tokens">
                    <Text fontWeight="bold" color="white">My Tokens</Text>
                  </Link>
                </HStack>
              </HStack>
              
              <WalletMultiButton />
            </Flex>
          </Container>
        </Box>
        
        {/* My Tokens Content */}
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading size="lg" mb={2}>My Proof-of-Participation Tokens</Heading>
              <Text color="gray.400">Your collection of compressed proof-of-participation tokens</Text>
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
                  <Text maxW="md" color="gray.400">Connect your Solana wallet to view your proof-of-participation tokens.</Text>
                  <WalletMultiButton />
                </VStack>
              </Card>
            ) : loading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                {[...Array(4)].map((_, i) => (
                  <Card key={i} bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl" overflow="hidden">
                    <Skeleton height="200px" />
                    <Box p={4}>
                      <Skeleton height="20px" width="80%" mb={2} />
                      <Skeleton height="16px" width="60%" mb={2} />
                      <Skeleton height="16px" width="40%" />
                    </Box>
                  </Card>
                ))}
              </SimpleGrid>
            ) : tokens.length === 0 ? (
              <Card p={10} textAlign="center" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
                <VStack spacing={6}>
                  <Box bg="gray.800" p={4} borderRadius="full">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                  <Heading color="white" size="md">No Tokens Found</Heading>
                  <Text maxW="md" color="gray.400">
                    You haven't claimed any proof-of-participation tokens yet. 
                    Scan a QR code at an event to get started.
                  </Text>
                  <Link href="/scan" passHref legacyBehavior>
                    <ButtonWithRef variant="solid">
                      Scan QR Code
                    </ButtonWithRef>
                  </Link>
                </VStack>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                {tokens.map(token => (
                  <Card 
                    key={token.id} 
                    bg="gray.900" 
                    borderColor="gray.700" 
                    borderWidth="1px" 
                    borderRadius="xl" 
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ 
                      transform: "translateY(-4px)", 
                      boxShadow: "0 8px 15px rgba(0,0,0,0.3)",
                      borderColor: "gray.600"
                    }}
                  >
                    <Box height="200px" overflow="hidden" position="relative">
                      <Image 
                        src={token.imageUrl} 
                        alt={token.tokenName} 
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        fallback={<Skeleton height="200px" />}
                      />
                      <Box 
                        position="absolute" 
                        bottom="0" 
                        left="0" 
                        right="0" 
                        bg="rgba(0,0,0,0.7)" 
                        px={4} 
                        py={2}
                      >
                        <Text fontWeight="bold">{token.tokenSymbol}</Text>
                      </Box>
                    </Box>
                    
                    <Box p={5}>
                      <Heading size="md" mb={2}>{token.tokenName}</Heading>
                      <Text color="gray.400" fontSize="sm" mb={3}>{token.eventName}</Text>
                      
                      <HStack fontSize="xs" color="gray.500">
                        <Box>
                          <Text>Claimed:</Text>
                          <Text>{formatDate(token.claimedAt)}</Text>
                        </Box>
                        
                        <Box flex="1" textAlign="right">
                          <Text>ID:</Text>
                          <Text fontFamily="mono">
                            {token.id.slice(0, 6)}...{token.id.slice(-4)}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default MyTokensPage;
