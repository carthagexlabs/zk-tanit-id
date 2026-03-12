import type { ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';
import type { ProofData } from './proof';

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
