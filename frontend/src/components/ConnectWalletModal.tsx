import { useState } from "react";
import { X, Wallet, AlertCircle, Loader } from "lucide-react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void | Promise<void>;
  isConnecting: boolean;
}

export function ConnectWalletModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
}: ConnectWalletModalProps) {
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setError("");
    try {
      await onConnect();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-linear-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-blue-500/20 bg-linear-to-r from-blue-900/40 to-cyan-900/40">
            <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
            <p className="text-sm text-blue-300 mt-1">
              Connect your Midnight wallet to proceed
            </p>
            <button
              onClick={onClose}
              disabled={isConnecting}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Wallet Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <Wallet className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Midnight Wallet Required
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    You'll need the Lace Midnight Preview extension installed to
                    connect.
                  </p>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Connection Details
              </p>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <span className="font-mono">Midnight Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Type:</span>
                  <span className="font-mono">Shielded Address</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start space-x-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                A popup will appear requesting authorization from your wallet.
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full mt-6 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-blue-500/20 bg-slate-900/30">
            <p className="text-center text-xs text-gray-400">
              Your assets remain fully secure and private
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
