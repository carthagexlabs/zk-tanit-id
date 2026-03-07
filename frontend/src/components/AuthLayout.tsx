import { useState } from "react";
import { Lock, LogOut, ArrowRight, LogIn } from "lucide-react";
import { SignInModal } from "./SignInModal";
import { ConnectWalletModal } from "./ConnectWalletModal";

interface AuthLayoutProps {
  isConnected: boolean;
  isConnecting: boolean;
  userAddress: string | null;
  isSignedIn: boolean;
  userEmail: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignOut: () => void;
}

// Helper function to shorten the address
const truncateAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 15)}...${address.slice(-4)}`;
};

export function AuthLayout({
  isConnected,
  isConnecting,
  userAddress,
  isSignedIn,
  userEmail,
  onConnect,
  onDisconnect,
  onSignIn,
  onSignOut,
}: AuthLayoutProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);

  // Step 1: Not signed in - show email signin button
  if (!isSignedIn) {
    return (
      <>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3">
            {/* <LogIn className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Sign in to start
            </span>*/}
          </div>
          <button
            onClick={() => setShowSignInModal(true)}
            className={`
              group relative
              text-white font-semibold
              px-5 py-2.5
              rounded-lg
              text-sm
              transition-all duration-500
              hover:scale-105
              shadow-md shadow-purple-500/20
              overflow-hidden will-change-transform
              bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/30
              cursor-pointer
            `}
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="flex items-center justify-center relative z-10">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In To Connet Wallet
            </span>
          </button>
        </div>
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSignIn={onSignIn}
        />
      </>
    );
  }

  // Step 2: Signed in but wallet not connected - show connect wallet button
  if (!isConnected) {
    return (
      <>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-purple-300 font-medium">
                {userEmail}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowConnectWalletModal(true)}
            disabled={isConnecting}
            className={`
              group relative
              text-white font-semibold
              px-5 py-2.5
              rounded-lg
              text-sm
              transition-all duration-500
              hover:scale-105
              shadow-md shadow-blue-500/20
              overflow-hidden will-change-transform
              bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30
              ${isConnecting ? "animate-pulse cursor-wait" : "cursor-pointer"}
            `}
          >
            {!isConnecting && (
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
            <span className="flex items-center justify-center relative z-10">
              {isConnecting ? (
                "Connecting..."
              ) : (
                <>
                  Connect Wallet{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300 will-change-transform" />
                </>
              )}
            </span>
          </button>
        </div>
        <ConnectWalletModal
          isOpen={showConnectWalletModal}
          onClose={() => setShowConnectWalletModal(false)}
          onConnect={onConnect}
          isConnecting={isConnecting}
        />
      </>
    );
  }

  // Step 3: Both signed in and wallet connected - show user menu
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`
          group relative
          text-white font-semibold
          px-5 py-2.5
          rounded-lg
          text-sm
          transition-all duration-500
          hover:scale-105
          shadow-md shadow-green-500/20
          overflow-hidden will-change-transform
          bg-linear-to-r from-green-600 to-blue-600 cursor-pointer
          flex items-center space-x-2
        `}
      >
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        <span className="hidden sm:inline">
          {truncateAddress(userAddress!)}
        </span>
        <span className="sm:hidden">Connected</span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-purple-500/30 rounded-lg shadow-xl shadow-purple-500/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-purple-500/20">
            <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold">
              Wallet
            </p>
            <p className="text-sm text-white font-mono mt-1 break-all">
              {userAddress}
            </p>
          </div>

          {/* Status Info */}
          <div className="px-4 py-3 space-y-2 border-b border-purple-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">Midnight Testnet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-xs text-purple-400">
                Signed in as {userEmail}
              </span>
            </div>
          </div>

          {/* Disconnect Buttons */}
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => {
                onDisconnect();
                setShowMenu(false);
              }}
              className="
                w-full
                flex items-center justify-center
                space-x-2
                px-3 py-2
                rounded-lg
                bg-orange-600/20 hover:bg-orange-600/30
                text-orange-300 hover:text-orange-200
                transition-all duration-300
                text-sm font-medium
                border border-orange-500/30 hover:border-orange-500/50
              "
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect Wallet</span>
            </button>
            <button
              onClick={() => {
                onSignOut();
                setShowMenu(false);
              }}
              className="
                w-full
                flex items-center justify-center
                space-x-2
                px-3 py-2
                rounded-lg
                bg-red-600/20 hover:bg-red-600/30
                text-red-300 hover:text-red-200
                transition-all duration-300
                text-sm font-medium
                border border-red-500/30 hover:border-red-500/50
              "
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
