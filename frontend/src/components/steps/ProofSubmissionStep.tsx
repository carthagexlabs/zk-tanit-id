import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Loader, ArrowLeft, ExternalLink } from 'lucide-react';

interface ProofSubmissionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ProofSubmissionStep({ onNext, onBack }: ProofSubmissionStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submissionSteps, setSubmissionSteps] = useState([
    { name: 'Connecting to Midnight Network', completed: false, current: false },
    { name: 'Broadcasting proof transaction', completed: false, current: false },
    { name: 'Waiting for network confirmation', completed: false, current: false },
    { name: 'Proof submitted to blockchain', completed: false, current: false }
  ]);

  useEffect(() => {
    if (!isSubmitting) return;

    const submitProof = async () => {
      for (let i = 0; i < submissionSteps.length; i++) {
        setSubmissionSteps(prev => prev.map((step, index) => ({
          ...step,
          current: index === i,
          completed: index < i
        })));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (i === submissionSteps.length - 2) {
          // Generate mock transaction hash
          const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
          setTxHash(mockTxHash);
        }
        
        setSubmissionSteps(prev => prev.map((step, index) => ({
          ...step,
          current: false,
          completed: index <= i
        })));
      }
      
      setTimeout(() => {
        onNext();
      }, 2000);
    };

    submitProof();
  }, [isSubmitting, onNext]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-3">Submit Proof to Midnight</h3>
        <p className="text-slate-300">
          Sending your zero-knowledge proof to the Midnight blockchain for verification.
        </p>
      </div>

      {!isSubmitting ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="h-10 w-10 text-blue-400" />
          </div>
          
          <h4 className="text-xl font-semibold text-white mb-3">Ready to Submit</h4>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Your zero-knowledge proof is ready to be submitted to the Midnight blockchain. 
            The blockchain will verify the proof without seeing your private data.
          </p>
          
          <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-white font-medium">Midnight Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gas Fee:</span>
                <span className="text-white font-medium">~0.001 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Proof Size:</span>
                <span className="text-white font-medium">2.1 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Time:</span>
                <span className="text-white font-medium">~10 seconds</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsSubmitting(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
          >
            Submit to Blockchain
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {submissionSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-600' 
                    : step.current 
                    ? 'bg-blue-600' 
                    : 'bg-slate-700'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : step.current ? (
                    <Loader className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <span className="text-white text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.completed ? 'text-green-400' : step.current ? 'text-blue-400' : 'text-slate-500'
                  }`}>
                    {step.name}
                  </p>
                  {step.current && (
                    <p className="text-sm text-slate-400 mt-1">Processing...</p>
                  )}
                  {step.completed && (
                    <p className="text-sm text-green-300 mt-1">✓ Complete</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {txHash && (
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-400" />
                <h4 className="text-lg font-semibold text-blue-400">Transaction Submitted</h4>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">Transaction Hash:</p>
                <div className="flex items-center justify-between">
                  <p className="text-blue-300 font-mono text-sm truncate">
                    {txHash.substring(0, 20)}...{txHash.substring(-10)}
                  </p>
                  <button className="ml-3 text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isSubmitting && (
        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
      )}
    </div>
  );
}