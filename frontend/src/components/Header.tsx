import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react";
import logo from "../assets/logo-zktanit.png";
import { useWallet } from "../hooks/useWallet";

// --- Helper function to shorten the address ---
const truncateAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 15)}...${address.slice(-4)}`;
};

export function Header() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  // Use wallet context instead of local state
  const { isConnected, isConnecting, userAddress, connect } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-purple-500/10"
          : "bg-black/20 backdrop-blur-md border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 group">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 transform transition-all duration-300 hover:scale-105">
            <div className="relative animate-pulse-slow">
              <img
                src={logo}
                alt="Logo"
                className="h-16 w-10 animate-pulse-slow transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400 hover:bg-clip-text">
                ZK-Tanit-ID
              </h1>
              <p className="text-xs text-purple-300 transition-all duration-300 opacity-80 hover:opacity-100">
                Privacy-Preserving Identity
              </p>
            </div>
          </div>

          {/* Status Indicators & Connect Button */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 transform transition-all duration-300 hover:scale-105">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm text-green-400 font-medium transition-all duration-300 hover:text-green-300">
                Midnight Network
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-2 transform transition-all duration-300 hover:scale-105">
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium transition-all duration-300 hover:text-blue-300">
                {" "}
                Secure{" "}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-2 transform transition-all duration-300 hover:scale-105">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium transition-all duration-300 hover:text-purple-300">
                Private
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/10 hover:border-white/30">
              <span className="text-xs font-medium text-purple-300 transition-all duration-300 hover:text-purple-200">
                TESTNET
              </span>
            </div>

            {/* Connection Button */}
            <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_1.6s_forwards]">
              <button
                onClick={connect}
                disabled={isConnecting || isConnected}
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
                  ${
                    isConnected
                      ? "bg-gradient-to-r from-green-600 to-blue-600 cursor-default"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/30"
                  }
                  ${isConnecting ? "animate-pulse cursor-wait" : ""}
                `}
              >
                {!isConnected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                )}
                <span className="flex items-center justify-center relative z-10">
                  {isConnecting ? (
                    "Connecting..."
                  ) : isConnected ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {truncateAddress(userAddress!)}
                    </>
                  ) : (
                    <>
                      Connect Wallet{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300 will-change-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
