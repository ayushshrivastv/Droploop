"use client";

import { useState } from 'react';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSolanaPayClaimUrl } from '@/lib/utils/qrcode';
import QRCode from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClaimForm } from '@/components/claim/new-claim-form';

export default function IntegrationTestPage() {
  const { publicKey, connected } = useWallet();
  const [logs, setLogs] = useState<{message: string, type: 'info' | 'success' | 'error' | 'warning'}[]>([]);
  const [mintAddress, setMintAddress] = useState('');
  const [eventName, setEventName] = useState('IntegrationTest');
  const [solanaPayUrl, setSolanaPayUrl] = useState('');
  const [standardUrl, setStandardUrl] = useState('');
  const [currentStage, setCurrentStage] = useState<'setup' | 'mint' | 'claim'>('setup');
  const [testMintAddress, setTestMintAddress] = useState('');
  const [solanaPayQrVisible, setSolanaPayQrVisible] = useState(false);

  // Add a log entry
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [...prev, {
      message: `[${new Date().toLocaleTimeString()}] ${message}`,
      type
    }]);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Generate test mint address
  const generateTestMintAddress = () => {
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toBase58();
    setTestMintAddress(mintAddress);
    setMintAddress(mintAddress);
    addLog(`Generated test mint address: ${mintAddress}`, 'success');
  };

  // Generate URLs
  const generateUrls = () => {
    try {
      if (!testMintAddress) {
        addLog('Please generate a test mint address first', 'warning');
        return;
      }

      const mint = new PublicKey(testMintAddress);

      // Generate a Solana Pay URL
      const dummyRecipient = publicKey || new PublicKey('F6CXpkFqabazi6LcfFLkwbQdqSVBNUAVWuEqe2mdE9DK');
      const solPayUrl = createSolanaPayClaimUrl(
        dummyRecipient,
        mint,
        eventName,
        `Integration test for ${eventName}`
      );
      setSolanaPayUrl(solPayUrl);

      // Generate a standard claim URL
      const baseUrl = window.location.origin;
      const stdUrl = `${baseUrl}/claim?event=${encodeURIComponent(eventName)}&mint=${mint.toBase58()}`;
      setStandardUrl(stdUrl);

      addLog('URLs generated successfully', 'success');
      setCurrentStage('mint');
    } catch (error) {
      addLog(`Error generating URLs: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  // Handle claim attempt
  const handleClaimAttempt = (success: boolean, message: string) => {
    if (success) {
      addLog(`Claim successful: ${message}`, 'success');
      setCurrentStage('claim');
    } else {
      addLog(`Claim failed: ${message}`, 'error');
    }
  };

  return (
    <AppleLayout>
      <div className="container mx-auto pt-8 pb-16">
        <h1 className="text-3xl font-bold mb-4">Integration Test</h1>
        <p className="text-muted-foreground mb-8">
          This page demonstrates the full mint-to-claim flow for testing purposes.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Test Controls */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>
                  Setup the test parameters for token minting and claiming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="setup" value={currentStage} onValueChange={(value) => setCurrentStage(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger value="mint" disabled={!testMintAddress}>Mint</TabsTrigger>
                    <TabsTrigger value="claim" disabled={!solanaPayUrl}>Claim</TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">Event Name</Label>
                      <Input
                        id="eventName"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Enter an event name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mintAddress">Test Mint Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="mintAddress"
                          value={testMintAddress}
                          onChange={(e) => setTestMintAddress(e.target.value)}
                          placeholder="Generated test mint address will appear here"
                          readOnly
                        />
                        <Button onClick={generateTestMintAddress} type="button" size="sm">
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Normally this would be a real mint from a transaction, but for testing we'll use a generated address
                      </p>
                    </div>

                    <Button
                      onClick={generateUrls}
                      className="w-full"
                      disabled={!testMintAddress}
                    >
                      Generate Test URLs
                    </Button>
                  </TabsContent>

                  <TabsContent value="mint" className="space-y-4 mt-4">
                    <Alert className="bg-yellow-900/20 border-yellow-700">
                      <AlertDescription>
                        In a real scenario, this step would involve actually minting a token. For testing purposes, we are simulating with a generated address.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Standard Claim URL</Label>
                      <div className="p-3 bg-black/70 rounded-md">
                        <p className="text-xs text-green-400 font-mono break-all">{standardUrl}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Solana Pay URL</Label>
                      <div className="p-3 bg-black/70 rounded-md">
                        <p className="text-xs text-green-400 font-mono break-all">{solanaPayUrl}</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={() => setSolanaPayQrVisible(!solanaPayQrVisible)}
                        variant="outline"
                      >
                        {solanaPayQrVisible ? 'Hide QR Code' : 'Show QR Code'}
                      </Button>
                    </div>

                    {solanaPayQrVisible && solanaPayUrl && (
                      <div className="flex justify-center p-4">
                        <div className="bg-white p-3 rounded-md">
                          <QRCode value={solanaPayUrl} size={200} />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setCurrentStage('claim')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      Proceed to Claim Testing
                    </Button>
                  </TabsContent>

                  <TabsContent value="claim" className="space-y-4 mt-4">
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg mb-4">
                      <h3 className="text-lg font-medium mb-2">Claim Testing</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a claim method to test:
                      </p>

                      <div className="space-y-3">
                        <Button
                          onClick={() => {
                            addLog(`Testing direct mint address: ${testMintAddress}`, 'info');
                          }}
                          className="w-full mb-2"
                          variant="outline"
                        >
                          Test Direct Mint Address
                        </Button>

                        <Button
                          onClick={() => {
                            addLog(`Testing standard URL: ${standardUrl}`, 'info');
                            window.open(standardUrl, '_blank');
                          }}
                          className="w-full mb-2"
                        >
                          Test Standard URL
                        </Button>

                        <Button
                          onClick={() => {
                            addLog(`Testing Solana Pay URL`, 'info');
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          Test Solana Pay URL
                        </Button>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="text-md font-medium mb-2">Manual Testing</h3>
                      <ClaimForm
                        initialClaimCode={testMintAddress}
                        initialEvent={{
                          name: eventName,
                          mint: testMintAddress
                        }}
                        onClaimAttempt={handleClaimAttempt}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Logs */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Test Logs</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLogs}
                >
                  Clear Logs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-md p-4 h-[500px] overflow-auto">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No logs yet. Start the test to see output here.
                    </p>
                  ) : (
                    <div className="space-y-1 font-mono text-sm">
                      {logs.map((log, index) => (
                        <div
                          key={index}
                          className={`
                            ${log.type === 'info' ? 'text-blue-400' : ''}
                            ${log.type === 'success' ? 'text-green-400' : ''}
                            ${log.type === 'error' ? 'text-red-400' : ''}
                            ${log.type === 'warning' ? 'text-yellow-400' : ''}
                          `}
                        >
                          {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
