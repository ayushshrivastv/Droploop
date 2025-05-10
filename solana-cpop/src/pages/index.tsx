import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  SimpleGrid, 
  Image,
  Spacer,
  Flex
} from "@chakra-ui/react";
import {
  Button,
  Card,
  CardBody,
  HStack,
  VStack
} from "@/components/campaign/ChakraAdapter";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const { connected } = useWallet();
  
  // Use client-side only rendering for footer links to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>cZK Referral Program</title>
        <meta name="description" content="ZK Compression Referral Program on Solana" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main" minH="100vh" bg="black">
        {/* Navigation */}
        <Flex as="nav" p={4} borderBottom="1px solid" borderColor="gray.800" align="center">
          <Heading size="md" letterSpacing="tight">cZK REFERRAL</Heading>
          <Spacer />
          <HStack spacing={6}>
            <Link href="/dashboard" passHref>
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <WalletMultiButton />
          </HStack>
        </Flex>

        {/* Hero Section */}
        <Container maxW="container.xl" py={20}>
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={10}>
            <VStack align="start" spacing={6} maxW="600px">
              <Heading size="2xl" lineHeight="1.2">
                Zero-Knowledge Referrals with Compression
              </Heading>
              <Text fontSize="xl" color="gray.400">
                Create scalable referral campaigns on Solana that use ZK compression to reduce costs and increase efficiency.
              </Text>
              <HStack spacing={4} pt={4}>
                <Link href="/dashboard" passHref>
                  <Button size="lg">
                    {connected ? "Manage Campaigns" : "Get Started"}
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </HStack>
            </VStack>
            
            <Box 
              border="1px solid" 
              borderColor="gray.800" 
              p={8} 
              borderRadius="md"
              bg="gray.900"
              boxShadow="0 0 20px rgba(255, 255, 255, 0.05)"
              maxW="400px"
              w="100%"
            >
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="bold">QR Code Sample</Text>
                <Box p={4} bg="white" borderRadius="md">
                  {/* Placeholder for QR code image */}
                  <Box width="200px" height="200px" bg="black" mx="auto" />
                </Box>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  Each referral link generates a unique compressed token using Solana's ZK compression.
                </Text>
              </VStack>
            </Box>
          </Flex>
        </Container>

        {/* Features Section */}
        <Box bg="gray.900" py={20}>
          <Container maxW="container.xl">
            <Heading textAlign="center" mb={16}>Why Use ZK Compression?</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
              <Card bg="black" borderColor="gray.800" borderWidth="1px">
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="md">Gas Efficiency</Heading>
                    <Text>
                      Reduce transaction costs by up to 95% compared to traditional NFT tokens.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg="black" borderColor="gray.800" borderWidth="1px">
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="md">Scalable Campaigns</Heading>
                    <Text>
                      Run campaigns with thousands of referrals without bloating Solana's state.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg="black" borderColor="gray.800" borderWidth="1px">
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="md">Verifiable On-Chain</Heading>
                    <Text>
                      All referrals are verifiable on-chain using Merkle proofs.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Container maxW="container.xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading>Ready to Start Your Referral Campaign?</Heading>
            <Text fontSize="xl" maxW="700px">
              Create a campaign, generate referral links, and track conversions - all leveraging the power of Solana's ZK compression.
            </Text>
            <Link href="/dashboard" passHref>
              <Button size="lg">
                Launch Dashboard
              </Button>
            </Link>
          </VStack>
        </Container>

        {/* Footer */}
        <Box borderTop="1px solid" borderColor="gray.800" py={10}>
          <Container maxW="container.xl">
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
              <Text color="gray.500">© 2025 cZK Referral Program</Text>
              <HStack spacing={4} color="gray.500">
                {isMounted ? (
                  <>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Documentation</a>
                  </>
                ) : (
                  <Text color="gray.500">© 2025</Text>
                )}
              </HStack>
            </Flex>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Home;
