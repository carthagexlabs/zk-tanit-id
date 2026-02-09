import { createContext, useState, useCallback, useRef, ReactNode } from 'react';
import '@midnight-ntwrk/dapp-connector-api';
import type {
  InitialAPI,
  ConnectedAPI,
  Configuration,
} from '@midnight-ntwrk/dapp-connector-api';

// Network ID — must match what Lace is configured to
const MIDNIGHT_NETWORK_ID = 'preprod';

/**
 * Proof data structure
 */
export interface ProofData {
  proof: string;
  publicInputs: Record<string, unknown>;
  kind: string;
  timestamp: number;
}

/**
 * Wallet context interface
 */
export interface WalletContextType {
  walletApi: ConnectedAPI | null;
  isConnected: boolean;
  isConnecting: boolean;
  userAddress: string | null;
  configuration: Configuration | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  submitProofTransaction: (proofData: ProofData) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wrap a promise with a timeout so it doesn't hang forever
const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms / 1000}s`));
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
};

// Poll for the Midnight Lace wallet with timeout (handles extension injection timing)
const waitForWalletProvider = (timeoutMs = 3000): Promise<InitialAPI | null> => {
  return new Promise((resolve) => {
    if (window.midnight?.mnLace) {
      resolve(window.midnight.mnLace);
      return;
    }

    const pollInterval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += pollInterval;
      if (window.midnight?.mnLace) {
        clearInterval(timer);
        console.log('[ZKTanitID] Midnight Lace detected after', elapsed, 'ms');
        resolve(window.midnight.mnLace);
      } else if (elapsed >= timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, pollInterval);
  });
};

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  // Synchronous guard to prevent double-connect (React state updates are async)
  const connectingRef = useRef(false);

  const connect = useCallback(async () => {
    console.log('[ZKTanitID] Connect clicked. Guard state:', {
      connectingRef: connectingRef.current,
      isConnected,
    });

    if (connectingRef.current || isConnected) {
      console.log('[ZKTanitID] Connect blocked — already connecting or connected');
      return;
    }
    connectingRef.current = true;
    setIsConnecting(true);
    console.log('[ZKTanitID] Step 1/5: Searching for Lace Midnight Preview extension...');

    try {
      const wallet = await waitForWalletProvider();

      if (!wallet) {
        console.error('[ZKTanitID] Step 1 FAILED: Wallet extension not found after 3s polling');
        alert(
          'Lace Midnight Preview wallet not detected.\n\n' +
          'Make sure you have the "Lace Midnight Preview" extension installed ' +
          '(this is separate from the regular Cardano Lace wallet).'
        );
        return;
      }

      console.log('[ZKTanitID] Step 1/5 OK: Wallet found:', wallet.name, 'v' + wallet.apiVersion);
      console.log('[ZKTanitID] Step 2/5: Calling wallet.connect("' + MIDNIGHT_NETWORK_ID + '") — waiting for Lace popup authorization...');

      // v4 API: connect(networkId) triggers the Lace authorization popup
      // 60s timeout — if user closes the popup without responding, the promise hangs forever
      const api = await withTimeout(
        wallet.connect(MIDNIGHT_NETWORK_ID),
        60_000,
        'Wallet connection'
      );

      console.log('[ZKTanitID] Step 2/5 OK: Authorization granted. Connected API methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(api)));
      console.log('[ZKTanitID] Step 3/5: Fetching shielded address...');

      const addresses = await api.getShieldedAddresses();
      setWalletApi(api);
      setUserAddress(addresses.shieldedAddress);

      console.log('[ZKTanitID] Step 3/5 OK: Shielded address:', addresses.shieldedAddress);
      console.log('[ZKTanitID] Step 4/5: Fetching network configuration...');

      const config = await api.getConfiguration();
      setConfiguration(config);

      console.log('[ZKTanitID] Step 4/5 OK: Configuration:', {
        networkId: config.networkId,
        indexerUri: config.indexerUri,
        substrateNodeUri: config.substrateNodeUri,
      });

      setIsConnected(true);
      console.log('[ZKTanitID] Step 5/5: Wallet fully connected!', {
        address: addresses.shieldedAddress,
        network: config.networkId,
      });
    } catch (error: unknown) {
      console.error('[ZKTanitID] Connection FAILED at current step:', error);

      const apiError = error as { type?: string; code?: string; reason?: string; message?: string };
      if (apiError.type === 'DAppConnectorAPIError') {
        console.error('[ZKTanitID] DApp Connector error — code:', apiError.code, 'reason:', apiError.reason);
        if (apiError.code === 'Rejected') {
          alert('Connection was rejected by the user.');
        } else {
          alert(`Wallet error: ${apiError.reason || apiError.code}`);
        }
      } else {
        console.error('[ZKTanitID] Non-API error:', apiError.message);
        alert('Wallet connection failed: ' + (apiError.message || 'Unknown error'));
      }
    } finally {
      setIsConnecting(false);
      connectingRef.current = false;
      console.log('[ZKTanitID] Connect flow finished. Guard reset.');
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    console.log('[ZKTanitID] Disconnecting wallet...');
    setWalletApi(null);
    setIsConnected(false);
    setUserAddress(null);
    setConfiguration(null);
    console.log('[ZKTanitID] Wallet disconnected. State reset.');
  }, []);

  const submitProofTransaction = useCallback(async (proofData: ProofData): Promise<void> => {
    if (!walletApi) {
      throw new Error('Wallet not connected');
    }

    console.log('[ZKTanitID] Submit TX: Starting with proof kind:', proofData.kind);
    console.log('[ZKTanitID] Submit TX: Balancing sealed transaction...');

    const balanced = await walletApi.balanceSealedTransaction(proofData.proof);
    console.log('[ZKTanitID] Submit TX: Balanced. Submitting to network...');

    await walletApi.submitTransaction(balanced.tx);
    console.log('[ZKTanitID] Submit TX: Transaction submitted successfully');
  }, [walletApi]);

  const value: WalletContextType = {
    walletApi,
    isConnected,
    isConnecting,
    userAddress,
    configuration,
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
