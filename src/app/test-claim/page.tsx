"use client";

import { useState } from 'react';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSolanaPayClaimUrl } from '@/lib/utils/qrcode';
import QRCode from 'qrcode.react';
import { ClaimForm } from '@/components/claim/new-claim-form';

export default function TestClaimPage() {
  const { publicKey } = useWallet();
  const [mintAddress, setMintAddress] = useState('');
  const [solanaPayUrl, setSolanaPayUrl] = useState('');
  const [standardUrl, setStandardUrl] = useState('');
  const [eventName, setEventName] = useState('TestEvent');
  const [showTester, setShowTester] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testLog, setTestLog] = useState<string[]>([]);

  // Generate URLs based on provided mint address
  const generateUrls = () => {
    try {
      // Validate mint address
      const mint = new PublicKey(mintAddress);

      // Generate a Solana Pay URL
      // For testing, we're using a dummy recipient (would be the admin's wallet in production)
      const dummyRecipient = publicKey || new PublicKey('F6CXpkFqabazi6LcfFLkwbQdqSVBNUAVWuEqe2mdE9DK');
      const solPayUrl = createSolanaPayClaimUrl(
        dummyRecipient,
        mint,
        eventName,
        `Test claim for ${eventName}`
      );
      setSolanaPayUrl(solPayUrl);

      // Generate a standard claim URL
      const baseUrl = window.location.origin;
      const stdUrl = `${baseUrl}/claim?event=${encodeURIComponent(eventName)}&mint=${mint.toBase58()}`;
      setStandardUrl(stdUrl);

      // Log success
      addToLog('✅ URLs generated successfully');
      addToLog(`Mint address: ${mint.toBase58()}`);
    } catch (error) {
      console.error('Error generating URLs:', error);
      addToLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Start the test process
  const runTest = (type: 'solana-pay' | 'standard' | 'direct') => {
    setTestState('testing');
    setShowTester(true);

    // Log the test starting
    addToLog(`🧪 Starting test with ${type} approach`);

    if (type === 'solana-pay') {
      addToLog(`Testing Solana Pay URL: ${solanaPayUrl.substring(0, 40)}...`);
    } else if (type === 'standard') {
      addToLog(`Testing Standard URL: ${standardUrl.substring(0, 40)}...`);
    } else {
      addToLog(`Testing Direct Mint Address: ${mintAddress}`);
    }
  };

  // Helper to add to the test log
  const addToLog = (message: string) => {
    setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Clear the test log
  const clearLog = () => {
    setTestLog([]);
  };

  return (
    <AppleLayout>
      <div className="container mx-auto pt-8 pb-16">
        <h1 className="text-3xl font-bold mb-4">Claim Functionality Test Page</h1>
        <p className="text-muted-foreground mb-8">
          This page helps test token claiming functionality using different methods.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* URL Generator Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>URL Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mint-address">Mint Address</Label>
                  <Input
                    id="mint-address"
                    placeholder="Enter a valid Solana mint address"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    placeholder="Enter event name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateUrls}
                  className="w-full"
                  variant="outline"
                >
                  Generate Test URLs
                </Button>

                {solanaPayUrl && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2">Solana Pay URL:</h3>
                    <p className="text-xs break-all mb-4">{solanaPayUrl}</p>

                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-2 rounded-md">
                        <QRCode value={solanaPayUrl} size={150} />
                      </div>
                    </div>

                    <Button
                      onClick={() => runTest('solana-pay')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      Test Solana Pay URL
                    </Button>
                  </div>
                )}

                {standardUrl && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2">Standard Claim URL:</h3>
                    <p className="text-xs break-all mb-4">{standardUrl}</p>

                    <Button
                      onClick={() => runTest('standard')}
                      className="w-full"
                    >
                      Test Standard URL
                    </Button>
                  </div>
                )}

                {mintAddress && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2">Direct Mint Address:</h3>
                    <p className="text-xs break-all mb-4">{mintAddress}</p>

                    <Button
                      onClick={() => runTest('direct')}
                      className="w-full"
                      variant="secondary"
                    >
                      Test Direct Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Results & Claim Tester */}
          <div className="lg:col-span-2 space-y-8">
            {/* Test Log */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Test Log</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLog}
                >
                  Clear
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-black/90 text-green-400 font-mono p-4 rounded-md h-[200px] overflow-auto text-sm">
                  {testLog.length > 0 ? (
                    testLog.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap mb-1">{log}</div>
                    ))
                  ) : (
                    <div className="text-muted-foreground italic">
                      No test logs yet. Generate URLs and run tests to see results here.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Claim Tester */}
            {showTester && (
              <div className="border rounded-lg p-6 bg-gradient-to-r from-slate-900 to-slate-800">
                <h2 className="text-xl font-bold mb-4">Claim Token Test</h2>
                <Alert className="mb-4 bg-blue-900/20 border-blue-700">
                  <AlertDescription>
                    This is a test environment. Connect your wallet and attempt to claim a token.
                    Any errors or success messages will appear here and in the test log.
                  </AlertDescription>
                </Alert>

                <ClaimForm onClaimAttempt={(success, message) => {
                  if (success) {
                    setTestState('success');
                    addToLog(`✅ Claim successful: ${message}`);
                  } else {
                    setTestState('error');
                    addToLog(`❌ Claim failed: ${message}`);
                  }
                }} />

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTester(false);
                      setTestState('idle');
                    }}
                  >
                    Close Tester
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
