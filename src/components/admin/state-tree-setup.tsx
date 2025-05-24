import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * StateTreeSetup Component
 * 
 * This component provides a UI for initializing a Light Protocol state tree,
 * which is required for compressed token operations.
 */
export function StateTreeSetup() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    treePublicKey?: string;
    signature?: string;
  } | null>(null);

  const initializeStateTree = async () => {
    try {
      setIsInitializing(true);
      setResult(null);

      // Call the API endpoint to initialize the state tree
      const response = await fetch('/api/token/init-state-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize state tree');
      }

      // Set the result with the response data
      setResult({
        success: true,
        message: 'State tree initialized successfully',
        treePublicKey: data.treePublicKey,
        signature: data.signature,
      });

      console.log('State tree initialized successfully:', data);
    } catch (error) {
      console.error('Error initializing state tree:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initialize state tree',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          Initialize State Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Before you can transfer compressed tokens, you need to initialize a state tree.
          This is a one-time setup operation that creates the necessary infrastructure
          for compressed token operations on the Solana blockchain.
        </p>

        {result && (
          <Alert className={`mb-4 ${result.success ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
            <AlertTitle className={result.success ? 'text-green-500' : 'text-destructive'}>
              {result.success ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {result.message}
              {result.success && result.treePublicKey && (
                <div className="mt-2">
                  <div className="font-medium">Tree Public Key:</div>
                  <div className="text-xs break-all">{result.treePublicKey}</div>
                </div>
              )}
              {result.success && result.signature && (
                <div className="mt-2">
                  <div className="font-medium">Transaction Signature:</div>
                  <div className="text-xs break-all">{result.signature}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={initializeStateTree}
          disabled={isInitializing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isInitializing ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Initializing...
            </>
          ) : (
            'Initialize State Tree'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
