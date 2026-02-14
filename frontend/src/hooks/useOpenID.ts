import { useContext } from 'react';
import { OpenIDContext, type OpenIDContextType } from '../contexts/OpenIDContext';

export function useOpenID(): OpenIDContextType {
  const context = useContext(OpenIDContext);

  if (context === undefined) {
    throw new Error('useOpenID must be used within an OpenIDProvider');
  }

  return context;
}
