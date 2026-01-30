import React, { createContext, useState, useCallback, ReactNode } from 'react';

// --- TypeScript Type Definitions ---

/**
 * The API object returned after a successful wallet.enable() call.
 */
export interface WalletApi {
  state: () => Promise<WalletState>;
  serviceUriConfig: () => Promise<ServiceURIs>;
  submitTransaction: (tx: TransactionPayload) => Promise<string>;
  balanceAndProveTransaction: (tx: TransactionPayload) => Promise<BalancedTransaction>;
}

/**
 * The state object returned from walletApi.state()
 */
export interface WalletState {
  shieldedAddress: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

/**
 * The service URIs for the Midnight network
 */
export interface ServiceURIs {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
}

/**
 * Transaction payload for submitting proofs
 */
export interface TransactionPayload {
  proof: string;
  publicInputs: Record<string, unknown>;
  contractAddress?: string;
}

/**
 * Balanced transaction result
 */
export interface BalancedTransaction {
  tx: unknown;
  hash: string;
}

/**
 * The wallet provider object injected into the window
 */
interface InjectedWallet {
  enable: () => Promise<WalletApi>;
  name: string;
  icon: string;
  apiVersion: string;
}

/**
 * Proof data structure
 */
export interface ProofData {
  proof: string;
  publicInputs: Record<string, unknown>;
  kind: string;
  timestamp: number;
}

// Type-safe way to access the global window object
declare global {
  interface Window {
    midnight?: {
      mnLace?: InjectedWallet;
    };
  }
}

/**
 * Wallet context interface
 */
export interface WalletContextType {
  // State
  walletApi: WalletApi | null;
  isConnected: boolean;
  isConnecting: boolean;
  userAddress: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;

  // Transaction methods
  submitProofTransaction: (proofData: ProofData) => Promise<string>;
}

// Create context with undefined default
export const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Helper function to find the wallet provider
const getWalletProvider = (): InjectedWallet | null => {
  if (window.midnight && window.midnight.mnLace) {
    return window.midnight.mnLace;
  }
  return null;
};

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletApi, setWalletApi] = useState<WalletApi | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    const wallet = getWalletProvider();

    if (!wallet) {
      alert('Please install the Lace Midnight Preview wallet.');
      setIsConnecting(false);
      return;
    }

    try {
      // Request connection
      const api = await wallet.enable();
      setWalletApi(api);

      // Get wallet state (like address)
      const state = await api.state();
      setUserAddress(state.shieldedAddress);
      setIsConnected(true);

      console.log('Wallet connected!', state);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Wallet connection was rejected or failed.');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    setWalletApi(null);
    setIsConnected(false);
    setUserAddress(null);
    console.log('Wallet disconnected');
  }, []);

  const submitProofTransaction = useCallback(async (proofData: ProofData): Promise<string> => {
    if (!walletApi) {
      throw new Error('Wallet not connected');
    }

    console.log('Submitting proof transaction:', proofData);

    try {
      // Create the transaction payload
      const txPayload: TransactionPayload = {
        proof: proofData.proof,
        publicInputs: proofData.publicInputs,
      };

      // First, balance and prove the transaction
      console.log('Balancing and proving transaction...');
      const balancedTx = await walletApi.balanceAndProveTransaction(txPayload);
      console.log('Transaction balanced:', balancedTx);

      // Then submit the transaction
      console.log('Submitting transaction to network...');
      const txHash = await walletApi.submitTransaction(txPayload);
      console.log('Transaction submitted, hash:', txHash);

      return txHash;
    } catch (error) {
      console.error('Transaction submission failed:', error);
      throw error;
    }
  }, [walletApi]);

  const value: WalletContextType = {
    walletApi,
    isConnected,
    isConnecting,
    userAddress,
    connect,
    disconnect,
    submitProofTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
