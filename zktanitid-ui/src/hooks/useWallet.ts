import { useContext } from 'react';
import { WalletContext, WalletContextType } from '../contexts/WalletContext';

/**
 * Custom hook to access wallet context.
 * Must be used within a WalletProvider.
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  return context;
}
