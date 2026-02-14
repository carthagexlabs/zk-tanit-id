import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletProvider } from './WalletContext';
import { useWallet } from '../hooks/useWallet';

// Mock wallet API returned after connect()
const mockConnectedApi = {
  getShieldedAddresses: vi.fn().mockResolvedValue({
    shieldedAddress: 'midnight1qqtest1234567890abcdef',
    shieldedCoinPublicKey: '0xcoinpk',
    shieldedEncryptionPublicKey: '0xencpk',
  }),
  getUnshieldedAddress: vi.fn().mockResolvedValue({
    unshieldedAddress: 'midnight1unshielded',
  }),
  getDustAddress: vi.fn().mockResolvedValue({
    dustAddress: 'midnight1dust',
  }),
  getConfiguration: vi.fn().mockResolvedValue({
    indexerUri: 'https://indexer.testnet.midnight.network',
    indexerWsUri: 'wss://indexer.testnet.midnight.network',
    proverServerUri: 'https://prover.testnet.midnight.network',
    substrateNodeUri: 'wss://node.testnet.midnight.network',
    networkId: 'preprod',
  }),
  getConnectionStatus: vi.fn().mockResolvedValue({
    status: 'connected',
    networkId: 'preprod',
  }),
  getShieldedBalances: vi.fn().mockResolvedValue({}),
  getUnshieldedBalances: vi.fn().mockResolvedValue({}),
  getDustBalance: vi.fn().mockResolvedValue({ cap: 0n, balance: 0n }),
  balanceSealedTransaction: vi.fn().mockResolvedValue({ tx: 'balanced-tx' }),
  balanceUnsealedTransaction: vi.fn().mockResolvedValue({ tx: 'balanced-tx' }),
  submitTransaction: vi.fn().mockResolvedValue(undefined),
  makeTransfer: vi.fn(),
  makeIntent: vi.fn(),
  signData: vi.fn(),
  getProvingProvider: vi.fn(),
  getTxHistory: vi.fn().mockResolvedValue([]),
  hintUsage: vi.fn().mockResolvedValue(undefined),
};

// Mock InitialAPI (what window.midnight.mnLace exposes)
const mockWallet = {
  name: 'lace',
  apiVersion: '4.0.0',
  icon: '',
  rdns: 'io.lace.midnight',
  connect: vi.fn().mockResolvedValue(mockConnectedApi),
};

// Helper component that exposes wallet context for testing
function TestConsumer() {
  const { isConnected, isConnecting, userAddress, connect, disconnect, configuration } = useWallet();

  return (
    <div>
      <span data-testid="status">{isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'}</span>
      <span data-testid="address">{userAddress || 'none'}</span>
      <span data-testid="network">{configuration?.networkId || 'none'}</span>
      <button data-testid="connect-btn" onClick={connect}>Connect</button>
      <button data-testid="disconnect-btn" onClick={disconnect}>Disconnect</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <WalletProvider>
      <TestConsumer />
    </WalletProvider>
  );
}

describe('WalletContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Clean up window.midnight before each test
    delete (window as Record<string, unknown>).midnight;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Record<string, unknown>).midnight;
  });

  it('renders with initial disconnected state', () => {
    renderWithProvider();

    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('address')).toHaveTextContent('none');
    expect(screen.getByTestId('network')).toHaveTextContent('none');
  });

  it('shows alert when wallet extension is not installed', async () => {
    renderWithProvider();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('connect-btn'));

    // Wait for the polling timeout (3s) -- we use fake timers to speed this up
    await vi.waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Lace Midnight Preview wallet not detected')
      );
    }, { timeout: 5000 });

    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
  });

  it('connects successfully when wallet is available', async () => {
    // Inject mock wallet
    (window as Record<string, unknown>).midnight = { mnLace: mockWallet };

    renderWithProvider();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
    });

    expect(mockWallet.connect).toHaveBeenCalledWith('preprod');
    expect(mockConnectedApi.getShieldedAddresses).toHaveBeenCalled();
    expect(mockConnectedApi.getConfiguration).toHaveBeenCalled();
    expect(screen.getByTestId('address')).toHaveTextContent('midnight1qqtest1234567890abcdef');
    expect(screen.getByTestId('network')).toHaveTextContent('preprod');
  });

  it('detects wallet injected after page load (polling)', async () => {
    renderWithProvider();
    const user = userEvent.setup();

    // Start connect before wallet is available
    await user.click(screen.getByTestId('connect-btn'));

    // Simulate extension injecting after 200ms
    setTimeout(() => {
      (window as Record<string, unknown>).midnight = { mnLace: mockWallet };
    }, 200);

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
    }, { timeout: 5000 });

    expect(mockWallet.connect).toHaveBeenCalledWith('preprod');
  });

  it('handles user rejection', async () => {
    const rejectError = {
      type: 'DAppConnectorAPIError',
      code: 'Rejected',
      reason: 'User rejected',
      message: 'User rejected',
    };
    Object.setPrototypeOf(rejectError, Error.prototype);

    const rejectingWallet = {
      ...mockWallet,
      connect: vi.fn().mockRejectedValue(rejectError),
    };

    (window as Record<string, unknown>).midnight = { mnLace: rejectingWallet };

    renderWithProvider();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Connection was rejected by the user.');
    });

    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
  });

  it('handles generic wallet errors', async () => {
    const walletError = {
      type: 'DAppConnectorAPIError',
      code: 'InternalError',
      reason: 'Something broke',
      message: 'Something broke',
    };
    Object.setPrototypeOf(walletError, Error.prototype);

    const errorWallet = {
      ...mockWallet,
      connect: vi.fn().mockRejectedValue(walletError),
    };

    (window as Record<string, unknown>).midnight = { mnLace: errorWallet };

    renderWithProvider();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('connect-btn'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Wallet error: Something broke');
    });
  });

  it('disconnects and resets state', async () => {
    (window as Record<string, unknown>).midnight = { mnLace: mockWallet };

    renderWithProvider();
    const user = userEvent.setup();

    // Connect first
    await user.click(screen.getByTestId('connect-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
    });

    // Now disconnect
    await user.click(screen.getByTestId('disconnect-btn'));

    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('address')).toHaveTextContent('none');
    expect(screen.getByTestId('network')).toHaveTextContent('none');
  });

  it('does not connect twice when already connected', async () => {
    (window as Record<string, unknown>).midnight = { mnLace: mockWallet };

    renderWithProvider();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('connect-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
    });

    // Click again -- should be a no-op
    await user.click(screen.getByTestId('connect-btn'));

    expect(mockWallet.connect).toHaveBeenCalledTimes(1);
  });
});
