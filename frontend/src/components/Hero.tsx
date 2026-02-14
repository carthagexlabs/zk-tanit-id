import React from "react";
import { ArrowRight, Shield, Eye, Zap, Lock, Wallet, FileCheck } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

interface HeroProps {
  onStart: () => void;
  onStartOpenID?: () => void;
}

export function Hero({ onStart, onStartOpenID }: HeroProps) {
  const { isConnected, connect } = useWallet();
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 pt-32 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 space-y-6">
          <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_0.2s_forwards]">
            <div className="inline-flex items-center space-x-2 bg-purple-600/20 backdrop-blur-sm rounded-full px-4 py-2 transition-all duration-500 hover:scale-105 hover:bg-purple-600/30 border border-purple-500/20 hover:border-purple-500/40 will-change-transform group">
              <Zap className="h-4 w-4 text-yellow-400 animate-pulse-slow group-hover:text-yellow-300 transition-colors duration-300" />
              <span className="text-sm font-medium text-purple-300 transition-colors duration-300 group-hover:text-purple-200">
                Powered by Zero-Knowledge Proofs
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_0.4s_forwards] text-5xl md:text-6xl font-bold text-white leading-tight">
              Verify Your Identity
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent inline-block transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_0.6s_forwards] will-change-transform hover:scale-105 transition-transform duration-300">
                Without Revealing It
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_0.8s_forwards]">
              ZK-Tanit-ID enables privacy-preserving identity verification using
              zero-knowledge proofs. Prove you're over 18, have valid
              credentials, or meet requirements without exposing sensitive data.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_1.0s_forwards]">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:bg-white/15 group will-change-transform">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600/30 will-change-transform">
                <Lock className="h-6 w-6 text-purple-400 transition-colors duration-300 group-hover:text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 transition-colors duration-300 group-hover:text-purple-200">
                Data Stays Local
              </h3>
              <p className="text-slate-400 text-sm transition-colors duration-300 group-hover:text-slate-300">
                Your sensitive information never leaves your device
              </p>
            </div>
          </div>

          <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_1.2s_forwards]">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:bg-white/15 group will-change-transform">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600/30 will-change-transform">
                <Shield className="h-6 w-6 text-blue-400 transition-colors duration-300 group-hover:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 transition-colors duration-300 group-hover:text-blue-200">
                Zero-Knowledge Proofs
              </h3>
              <p className="text-slate-400 text-sm transition-colors duration-300 group-hover:text-slate-300">
                Mathematically prove claims without revealing data
              </p>
            </div>
          </div>

          <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_1.4s_forwards]">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:bg-white/15 group will-change-transform">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:bg-green-600/30 will-change-transform">
                <Eye className="h-6 w-6 text-green-400 transition-colors duration-300 group-hover:text-green-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 transition-colors duration-300 group-hover:text-green-200">
                Blockchain Verified
              </h3>
              <p className="text-slate-400 text-sm transition-colors duration-300 group-hover:text-slate-300">
                Proofs verified on Midnight blockchain network
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_1.6s_forwards]">
            {isConnected ? (
              <button
                onClick={onStart}
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-500 hover:from-purple-500 hover:to-blue-500 hover:scale-110 hover:shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/50 overflow-hidden will-change-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="flex items-center relative z-10">
                  Start Identity Verification
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300 will-change-transform" />
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={connect}
                  className="group relative bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-500 hover:from-amber-500 hover:to-orange-500 hover:scale-110 hover:shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/50 overflow-hidden will-change-transform"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="flex items-center relative z-10">
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet First
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300 will-change-transform" />
                  </span>
                </button>
                <p className="text-sm text-amber-400/80">
                  Please connect your Lace Midnight Preview wallet to start verification
                </p>
              </div>
            )}
          </div>

          {onStartOpenID && (
            <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_1.8s_forwards]">
              <button
                onClick={onStartOpenID}
                className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-500 hover:from-blue-500 hover:to-cyan-500 hover:scale-110 hover:shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/50 overflow-hidden will-change-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="flex items-center relative z-10">
                  <FileCheck className="mr-2 h-5 w-5" />
                  Present EU PID Credential
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300 will-change-transform" />
                </span>
              </button>
              <p className="text-sm text-blue-400/60 mt-2">
                OpenID4VP • SD-JWT-VC • eIDAS 2.0 compliant
              </p>
            </div>
          )}

          <div className="transform translate-y-10 opacity-0 animate-[slideInUp_0.6s_ease-out_2.0s_forwards]">
            <p className="text-sm text-slate-500 transition-colors duration-300 hover:text-slate-400">
              No registration required • Fully decentralized • Privacy
              guaranteed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
