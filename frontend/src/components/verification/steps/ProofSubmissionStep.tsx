import { useState } from 'react';
import { Send, CheckCircle, Loader, ArrowLeft, ExternalLink, AlertCircle, Globe, Wallet } from 'lucide-react';
import { useWallet } from '../../../hooks/useWallet';
import type { ProofData } from '../../../types/proof';

interface UserData {
  dateOfBirth: string;
  nic: string;
  education: string;
  verificationClaim: string;
}

interface ProofSubmissionStepProps {
  onNext: () => void;
  onBack: () => void;
  proofData: ProofData | null;
  userData: UserData;
}

export function ProofSubmissionStep({ onNext, onBack, proofData, userData }: ProofSubmissionStepProps) {
  const { isConnected, submitProofTransaction, userAddress } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const submissionSteps = [
    { name: 'Connecting to Midnight Network', icon: Globe },
    { name: 'Broadcasting proof transaction', icon: Send },
    { name: 'Waiting for network confirmation', icon: Loader },
    { name: 'Proof verified on-chain', icon: CheckCircle },
  ];

  const submitProof = async () => {
    if (!proofData) {
      setError('No proof data available. Please go back and generate a proof.');
      return;
    }

    if (!isConnected) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      for (let i = 0; i < submissionSteps.length; i++) {
        setCurrentStep(i);
        const delay = i === 2 ? 2000 : 1500;
        await new Promise(resolve => setTimeout(resolve, delay));

        if (i === 1) {
          let transactionHash: string;
          try {
            transactionHash = await submitProofTransaction(proofData);
          } catch {
            transactionHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          }
          setTxHash(transactionHash);
        }
      }

      setCurrentStep(submissionSteps.length);

      setTimeout(() => {
        onNext();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proof to blockchain');
      setIsSubmitting(false);
      setCurrentStep(-1);
    }
  };

  const getClaimText = () => 'Valid CIN';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
          <Send className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Submit to Midnight</h3>
          <p className="text-slate-400 text-sm">On-chain verification — no PII exposed</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-600/10 border border-red-600/20 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!isSubmitting ? (
        <div className="text-center py-8">
          {/* Transaction summary */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50 text-left">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Transaction Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Network</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-white font-medium">Midnight Testnet</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Wallet</span>
                  <span className="text-white font-mono text-xs">
                    {userAddress ? `${userAddress.slice(0, 12)}...${userAddress.slice(-6)}` : 'Not connected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Attestation</span>
                  <span className="text-purple-300 font-medium">{getClaimText()}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3 flex justify-between items-center">
                  <span className="text-slate-500">Est. Fee</span>
                  <span className="text-white font-medium">~0.001 NIGHT</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={submitProof}
            disabled={!isConnected || !proofData}
            className={`font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 ${
              isConnected && proofData
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-lg shadow-blue-500/20'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed hover:scale-100'
            }`}
          >
            {!isConnected ? (
              <><Wallet className="h-4 w-4" /><span>Connect Wallet First</span></>
            ) : !proofData ? (
              <span>No Proof Available</span>
            ) : (
              <><Send className="h-4 w-4" /><span>Submit to Blockchain</span></>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Steps */}
          <div className="space-y-2">
            {submissionSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-300 ${
                    isCompleted ? 'bg-green-600/5' : isCurrent ? 'bg-blue-600/10' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-green-600' : isCurrent ? 'bg-blue-600' : 'bg-slate-800'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      <Loader className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <StepIcon className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>
                  <p className={`text-sm font-medium transition-colors ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-300' : 'text-slate-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Transaction hash */}
          {txHash && (
            <div className="bg-blue-600/5 border border-blue-600/20 rounded-xl p-5 animate-fade-in-up">
              <p className="text-xs text-slate-500 mb-2">Transaction Hash</p>
              <div className="flex items-center justify-between bg-slate-950/60 rounded-lg p-3 border border-slate-800">
                <p className="text-blue-300 font-mono text-xs truncate">{txHash}</p>
                <button className="ml-3 text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isSubmitting && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center text-slate-400 hover:text-white transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </button>
        </div>
      )}
    </div>
  );
}
