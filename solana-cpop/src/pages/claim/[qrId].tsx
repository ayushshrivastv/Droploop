import React from 'react';
import { ReferralClaim } from '@/components/claim/ReferralClaim';
import { NextPage } from 'next';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Spacer, Heading } from '@chakra-ui/react';
import { HStack } from '@/components/campaign/ChakraAdapter';

const ClaimPage: NextPage = () => {
  return (
    <Box p={8} bg="black" minH="100vh" color="white">
      <HStack alignItems="center" mb={8} spacing={4}>
        <Heading color="white">Referral Reward Claim</Heading>
        <Spacer />
        <WalletMultiButton />
      </HStack>
      
      <ReferralClaim />
    </Box>
  );
};

export default ClaimPage;
