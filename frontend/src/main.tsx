import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { WalletProvider } from "./contexts/WalletContext";
import { UserProvider } from "./contexts/UserContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </UserProvider>
  </StrictMode>,
);
