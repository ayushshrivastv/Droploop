import React from 'react';
import { CampaignManager } from '@/components/campaign/CampaignManager';
import { NextPage } from 'next';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Heading, Text, Flex, Container, useColorModeValue } from '@chakra-ui/react';
import { HStack, VStack } from '@/components/campaign/ChakraAdapter';
import Head from 'next/head';
import Link from 'next/link';

const DashboardPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>cPOP Dashboard | Proof of Participation</title>
        <meta name="description" content="Create and manage your cPOP proof-of-participation tokens with ZK compression on Solana" />
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
                    <Text fontWeight="bold" color="white">Dashboard</Text>
                  </Link>
                  <Link href="/scan">
                    <Text color="gray.400" _hover={{ color: 'white' }}>Scan QR</Text>
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
        
        {/* Dashboard Content */}
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading size="lg" mb={2}>Event Manager Dashboard</Heading>
              <Text color="gray.400">Create and manage your proof-of-participation tokens with ZK compression</Text>
            </Box>
            
            <CampaignManager />
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;
