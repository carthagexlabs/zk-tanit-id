import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { WalletProvider } from './contexts/WalletContext';
import { OpenIDProvider } from './contexts/OpenIDContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <OpenIDProvider>
        <App />
      </OpenIDProvider>
    </WalletProvider>
  </StrictMode>
);
