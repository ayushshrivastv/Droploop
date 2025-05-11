import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useReferralClient } from '@/lib/referral-client';
import { Text, Heading, Input, Flex, Box, Grid, Badge, SimpleGrid, Icon, Tooltip } from '@chakra-ui/react';
import { Button, Card, VStack, HStack, Divider, FormControl, FormLabel, useToast, CardBody, LinkButton } from './ChakraAdapter';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';

// Custom icon components to replace Chakra UI icons
const CopyIcon = (props: any) => (
  <Box as="span" display="inline-block" {...props}>
    <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em">
      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
    </svg>
  </Box>
);

const ExternalLinkIcon = (props: any) => (
  <Box as="span" display="inline-block" {...props}>
    <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em">
      <path d="M10 6v2H5v11h11v-5h2v5c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V8c0-1.1.9-2 2-2h5zm11-3v8h-2V6.4l-7.8 7.8-1.4-1.4L17.6 5H13V3h8z"></path>
    </svg>
  </Box>
);

const AddIcon = (props: any) => (
  <Box as="span" display="inline-block" {...props}>
    <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
    </svg>
  </Box>
);

type Campaign = {
  id: string;
  eventName: string;
  tokenName: string;
  tokenSymbol: string;
  maxSupply: number;
  claimedCount: number;
  merkleTreeAddress: string;
  eventPda: string;
};

type ReferralLink = {
  id: string;
  qrCodeId: string;
  secretKey: string;
  isUsed: boolean;
  claimedBy: string | null;
  expirationTime: number;
  qrCodeData: string;
};

export const CampaignManager: React.FC = () => {
  const wallet = useWallet();
  const referralClient = useReferralClient(wallet);
  const toast = useToast();
  const router = useRouter();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  
  // New campaign form data
  const [newCampaign, setNewCampaign] = useState({
    campaignName: '',
    rewardName: '',
    rewardSymbol: '',
    maxReferrals: 100,
    campaignUri: 'https://example.com/campaign',
    rewardUri: 'https://example.com/reward'
  });
  
  // Load campaigns on mount
  useEffect(() => {
    if (wallet.connected) {
      loadCampaigns();
    }
  }, [wallet.connected]);
  
  // Load referral links when a campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      loadReferralLinks(selectedCampaign.id);
    }
  }, [selectedCampaign]);
  
  // Load all campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const userCampaigns = await referralClient.getMyReferralCampaigns();
      setCampaigns(userCampaigns);
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: 'Failed to load campaigns',
        status: 'error',
        duration: 5000,
      });
      setLoading(false);
    }
  };
  
  // Load referral links for a campaign
  const loadReferralLinks = async (campaignId: string) => {
    try {
      const links = await referralClient.getCampaignReferralLinks(campaignId);
      setReferralLinks(links);
    } catch (error) {
      console.error('Error loading referral links:', error);
      toast({
        title: 'Failed to load referral links',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Create a new campaign
  const createCampaign = async () => {
    if (!wallet.connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a campaign',
        status: 'warning',
        duration: 5000,
      });
      return;
    }
    
    try {
      setCreating(true);
      const result = await referralClient.createReferralCampaign(newCampaign);
      toast({
        title: 'Campaign created!',
        description: `Campaign "${newCampaign.campaignName}" has been created`,
        status: 'success',
        duration: 5000,
      });
      
      // Reset form and refresh campaigns
      setNewCampaign({
        campaignName: '',
        rewardName: '',
        rewardSymbol: '',
        maxReferrals: 100,
        campaignUri: 'https://example.com/campaign',
        rewardUri: 'https://example.com/reward'
      });
      await loadCampaigns();
      setCreating(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Failed to create campaign',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
      setCreating(false);
    }
  };
  
  // Generate a new referral link
  const generateReferralLink = async () => {
    if (!selectedCampaign) return;
    
    try {
      setGenerating(true);
      
      // One week expiration by default
      const oneWeekFromNow = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      
      const result = await referralClient.generateReferralLink(
        selectedCampaign.id, 
        oneWeekFromNow
      );
      
      // Refresh the list of referral links
      await loadReferralLinks(selectedCampaign.id);
      
      toast({
        title: 'Referral link generated!',
        status: 'success',
        duration: 5000,
      });
      
      setGenerating(false);
    } catch (error) {
      console.error('Error generating referral link:', error);
      toast({
        title: 'Failed to generate referral link',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
      setGenerating(false);
    }
  };
  
  // Copy referral link to clipboard
  const copyReferralLink = (qrCodeId: string, secretKey: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const referralUrl = `${baseUrl}/claim/${qrCodeId}?secret=${secretKey}`;
    
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: 'Referral link copied!',
      status: 'success',
      duration: 3000,
    });
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCampaign({
      ...newCampaign,
      [name]: name === 'maxReferrals' ? parseInt(value, 10) : value,
    });
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!wallet.connected) {
    return (
      <Card p={10} textAlign="center" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
        <VStack spacing={6}>
          <Box bg="gray.800" p={4} borderRadius="full">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V13C21 11.8954 20.1046 11 19 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Heading color="white" size="md">Connect Your Wallet</Heading>
          <Text maxW="md" color="gray.400">You need to connect your Solana wallet to create and manage your proof-of-participation events.</Text>
          <Box>
            <WalletMultiButton />
          </Box>
        </VStack>
      </Card>
    );
  }

  return (
    <Box width="100%" bg="black" color="white">
      {/* Dashboard Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card p={6} bg="gray.900" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
          <Text color="gray.400" fontSize="sm" mb={1}>Total Events</Text>
          <Heading color="white" size="xl">{campaigns.length}</Heading>
          <Text color="gray.500" fontSize="sm" mt={2}>Created events</Text>
        </Card>
        
        <Card p={6} bg="gray.900" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
          <Text color="gray.400" fontSize="sm" mb={1}>Total Tokens</Text>
          <Heading color="white" size="xl">
            {campaigns.reduce((total, campaign) => total + campaign.claimedCount, 0)} / {campaigns.reduce((total, campaign) => total + campaign.maxSupply, 0)}
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={2}>Claimed / Available</Text>
        </Card>
        
        <Card p={6} bg="gray.900" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
          <Text color="gray.400" fontSize="sm" mb={1}>Active Links</Text>
          <Heading color="white" size="xl">{referralLinks.filter(link => !link.isUsed).length}</Heading>
          <Text color="gray.500" fontSize="sm" mt={2}>Unclaimed QR codes</Text>
        </Card>
      </SimpleGrid>
      
      {/* Event Management Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="white" size="md">Your Proof-of-Participation Events</Heading>
        <Button 
          onClick={() => setShowNewCampaignForm(!showNewCampaignForm)}
          leftIcon={<AddIcon />}
          variant="solid"
        >
          {showNewCampaignForm ? 'Cancel' : 'Create New Event'}
        </Button>
      </Flex>
      
      {/* Create New Campaign Form */}
      {showNewCampaignForm && (
        <Card p={6} mb={8} bg="gray.900" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
          <Heading color="white" size="md" mb={4}>Create New Event</Heading>
          <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Campaign Name</FormLabel>
            <Input 
              name="campaignName" 
              value={newCampaign.campaignName} 
              onChange={handleInputChange} 
              placeholder="e.g., Summer Referral Program"
            />
          </FormControl>
          
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Reward Name</FormLabel>
              <Input 
                name="rewardName" 
                value={newCampaign.rewardName} 
                onChange={handleInputChange} 
                placeholder="e.g., Gold Badge"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Reward Symbol</FormLabel>
              <Input 
                name="rewardSymbol" 
                value={newCampaign.rewardSymbol} 
                onChange={handleInputChange} 
                placeholder="e.g., GOLD"
              />
            </FormControl>
          </HStack>
          
          <FormControl>
            <FormLabel>Maximum Referrals</FormLabel>
            <Input 
              name="maxReferrals" 
              type="number" 
              value={newCampaign.maxReferrals} 
              onChange={handleInputChange} 
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Campaign URI</FormLabel>
            <Input 
              name="campaignUri" 
              value={newCampaign.campaignUri} 
              onChange={handleInputChange} 
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Reward URI</FormLabel>
            <Input 
              name="rewardUri" 
              value={newCampaign.rewardUri} 
              onChange={handleInputChange} 
            />
          </FormControl>
          
          <Button 
            variant="solid" 
            onClick={createCampaign} 
            isLoading={creating}
            leftIcon={<AddIcon />}
          >
            Create Campaign
          </Button>
        </VStack>
      </Card>
      )}
      
      {/* Campaign List and Management */}
      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Campaign List */}
        <Card p={6} flex="1" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
          <Heading color="white" size="md" mb={4}>Your Events</Heading>
          {loading ? (
            <Flex justify="center" py={10}>
              <Text>Loading events...</Text>
            </Flex>
          ) : campaigns.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={10} textAlign="center">
              <Box bg="gray.800" p={4} borderRadius="full" mb={4}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Text mb={2}>No events created yet</Text>
              <Text color="gray.500" fontSize="sm" maxW="xs">
                Click the 'Create New Event' button to create your first proof-of-participation event.
              </Text>
            </Flex>
          ) : (
            <VStack spacing={4} align="stretch" maxH="450px" overflowY="auto" pr={2} css={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: '#1A202C' },
              '&::-webkit-scrollbar-thumb': { background: '#2D3748' },
            }}>
              {campaigns.map(campaign => (
                <Card 
                  key={campaign.id} 
                  p={4} 
                  cursor="pointer"
                  bg={selectedCampaign?.id === campaign.id ? "gray.800" : "gray.900"}
                  borderColor="gray.700"
                  borderWidth="1px"
                  borderRadius="lg"
                  transition="all 0.2s"
                  _hover={{ borderColor: "gray.600" }}
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <Flex justify="space-between" align="start">
                    <Box>
                      <Heading color="white" size="sm" mb={2}>{campaign.eventName}</Heading>
                      <Text fontSize="sm" color="gray.400" mb={2}>Token: {campaign.tokenName} ({campaign.tokenSymbol})</Text>
                      <Flex align="center">
                        <Box bg={campaign.claimedCount > 0 ? "green.900" : "gray.700"} px={2} py={1} borderRadius="md">
                          <Text fontSize="xs" color={campaign.claimedCount > 0 ? "green.300" : "gray.400"}>
                            {campaign.claimedCount} / {campaign.maxSupply} claimed
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                    {selectedCampaign?.id === campaign.id && (
                      <Badge colorScheme="green" variant="solid" px={2} py={1} borderRadius="full">Selected</Badge>
                    )}
                  </Flex>
                </Card>
              ))}
            </VStack>
          )}
        </Card>
        
        {/* Selected Campaign Details and Referral Links */}
        <Card p={6} flex="2" bg="black" borderColor="gray.800" borderWidth="1px" borderRadius="xl">
          {selectedCampaign ? (
            <>
              <Flex justify="space-between" align="start" mb={4}>
                <Box>
                  <Heading color="white" size="md" mb={1}>{selectedCampaign.eventName}</Heading>
                  <Text fontSize="sm" color="gray.500">Created with ZK compression</Text>
                </Box>
                <Badge colorScheme={selectedCampaign.claimedCount >= selectedCampaign.maxSupply ? "red" : "green"} px={3} py={1} borderRadius="full">
                  {selectedCampaign.claimedCount >= selectedCampaign.maxSupply ? "Fully Claimed" : "Active"}
                </Badge>
              </Flex>
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6} bg="gray.900" p={4} borderRadius="lg">
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Event ID</Text>
                  <Text fontSize="sm" fontFamily="mono" isTruncated title={selectedCampaign.id}>
                    {selectedCampaign.id.slice(0, 8)}...{selectedCampaign.id.slice(-8)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Merkle Tree Address</Text>
                  <Text fontSize="sm" fontFamily="mono" isTruncated title={selectedCampaign.merkleTreeAddress}>
                    {selectedCampaign.merkleTreeAddress.slice(0, 8)}...{selectedCampaign.merkleTreeAddress.slice(-8)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Progress</Text>
                  <Text>
                    <Text as="span" color="white" fontWeight="bold">{selectedCampaign.claimedCount}</Text>
                    <Text as="span" color="gray.500"> / {selectedCampaign.maxSupply} tokens claimed</Text>
                  </Text>
                </Box>
              </Grid>
              
              <Flex justify="space-between" align="center" mb={6}>
                <Heading color="white" size="sm">QR Codes & Links</Heading>
                <Button 
                  variant="solid" 
                  leftIcon={<AddIcon />}
                  onClick={generateReferralLink}
                  isLoading={generating}
                  isDisabled={selectedCampaign.claimedCount >= selectedCampaign.maxSupply}
                >
                  Generate New QR Code
                </Button>
              </Flex>
              
              <Divider mb={6} />
              
              <Heading color="white" size="sm" mb={4}>Your Referral Links</Heading>
              
              {referralLinks.length === 0 ? (
                <Text>No referral links generated yet. Create your first one!</Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {referralLinks.map(link => {
                    // Parse QR code data
                    let qrData = {};
                    try {
                      qrData = JSON.parse(link.qrCodeData || '{}');
                    } catch (e) {
                      console.error('Error parsing QR code data:', e);
                    }
                    
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    const referralUrl = `${baseUrl}/claim/${link.qrCodeId}?secret=${link.secretKey}`;
                    
                    return (
                      <Card key={link.id} p={4} bg={link.isUsed ? "gray.800" : "gray.900"} borderColor={link.isUsed ? "gray.700" : "gray.600"} borderWidth="1px" borderRadius="lg">
                        <Flex direction={{ base: "column", md: "row" }} gap={6} align="center">
                          {/* QR Code */}
                          <Box borderWidth={1} p={3} borderRadius="md" bg="white" position="relative">
                            <QRCodeSVG value={referralUrl} size={130} />
                            {link.isUsed && (
                              <Flex 
                                position="absolute" 
                                top="0" 
                                left="0" 
                                right="0" 
                                bottom="0" 
                                bg="rgba(0,0,0,0.7)" 
                                color="white"
                                justify="center"
                                align="center"
                                borderRadius="md"
                              >
                                <Text fontWeight="bold" color="red.300">CLAIMED</Text>
                              </Flex>
                            )}
                          </Box>
                          
                          {/* Link Details */}
                          <Box flex="1">
                            <Badge 
                              colorScheme={link.isUsed ? "red" : "green"} 
                              mb={3}
                            >
                              {link.isUsed ? "CLAIMED" : "AVAILABLE"}
                            </Badge>
                            
                            <Text fontWeight="bold" color="white" mb={2}>
                              QR Code ID: {link.qrCodeId.slice(0, 8)}...{link.qrCodeId.slice(-4)}
                            </Text>
                            
                            {link.isUsed && (
                              <Text color="gray.400" fontSize="sm" mb={2}>
                                <Text as="span" fontWeight="bold">Claimed by:</Text> {link.claimedBy?.slice(0, 8)}...{link.claimedBy?.slice(-4) || 'Unknown'}
                              </Text>
                            )}
                            
                            <Text fontSize="sm" color="gray.400" mb={3}>
                              <Text as="span" fontWeight="bold">Expires:</Text> {formatDate(link.expirationTime)}
                            </Text>
                            
                            <HStack spacing={4} mt={2}>
                              <Button
                                leftIcon={<CopyIcon />}
                                onClick={() => copyReferralLink(link.qrCodeId, link.secretKey)}
                                isDisabled={link.isUsed}
                                variant="outline"
                                size="sm"
                              >
                                Copy Link
                              </Button>
                              
                              <LinkButton
                                href={referralUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
                                isDisabled={link.isUsed}
                                leftIcon={<ExternalLinkIcon />}
                              >
                                View in Browser
                              </LinkButton>
                            </HStack>
                          </Box>
                        </Flex>
                      </Card>
                    );
                  })}
                </VStack>
              )}
            </>
          ) : (
            <Flex direction="column" align="center" justify="center" height="300px" textAlign="center">
              <Box bg="gray.800" p={4} borderRadius="full" mb={4}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Heading size="sm" color="white" mb={2}>No Event Selected</Heading>
              <Text color="gray.500" fontSize="sm" maxW="md">
                Select an event from the list to view and manage its QR codes, or create a new event if you haven't already.
              </Text>
            </Flex>
          )}
        </Card>
      </Flex>
    </Box>
  );
};
