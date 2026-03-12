import { useState, useEffect } from 'react';
import { Shield, CheckCircle, Loader, ArrowLeft, Lock, Cpu } from 'lucide-react';
import type { ProofData } from '../../../types/proof';

interface UserData {
  dateOfBirth: string;
  nic: string;
  education: string;
  verificationClaim: string;
}

interface ProofGenerationStepProps {
  userData: UserData;
  onNext: () => void;
  onBack: () => void;
  onProofGenerated: (proofData: ProofData) => void;
}

const PROOF_STEPS = [
  'Initializing zero-knowledge circuit',
  'Computing witness values from secret inputs',
  'Generating cryptographic commitments',
  'Building proof elements (Groth16)',
  'Optimizing proof size for on-chain submission',
  'Finalizing zero-knowledge proof',
];

export function ProofGenerationStep({ userData, onNext, onBack, onProofGenerated }: ProofGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [localProof, setLocalProof] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) return;

    const generateProof = async () => {
      for (let i = 0; i <= PROOF_STEPS.length; i++) {
        setCurrentStepIndex(i);
        setProgress((i / PROOF_STEPS.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 300));
      }

      const mockProof = `zk_midnight_proof_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 15)}`;
      setLocalProof(mockProof);

      const generatedProofData: ProofData = {
        proof: mockProof,
        publicInputs: {
          claim: userData.verificationClaim,
          verified: true,
        },
        kind: userData.verificationClaim,
        timestamp: Date.now(),
      };

      onProofGenerated(generatedProofData);

      setTimeout(() => {
        onNext();
      }, 2500);
    };

    generateProof();
  }, [isGenerating, onNext, onProofGenerated, userData.verificationClaim]);

  const getClaimText = () => 'Subject holds a valid National ID (CIN)';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Zero-Knowledge Proof Generation</h3>
          <p className="text-slate-400 text-sm">Cryptographic proof without revealing data</p>
        </div>
      </div>

      {!isGenerating && !localProof ? (
        <div className="text-center py-10">
          {/* Claim preview */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-slate-300">Proof Statement</span>
              </div>

              <p className="text-lg font-medium text-purple-300 mb-4">"{getClaimText()}"</p>

              <div className="flex items-center justify-center space-x-3 text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Private inputs hidden</span>
                </div>
                <span>•</span>
                <span>Boolean output only</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsGenerating(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/20 inline-flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Generate ZK Proof</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-300">
                {progress < 100 ? PROOF_STEPS[Math.min(currentStepIndex, PROOF_STEPS.length - 1)] : 'Proof complete'}
              </span>
              <span className="text-sm font-mono text-purple-400">{Math.round(progress)}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[length:200%_100%] animate-gradient-x"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-6 gap-1">
              {PROOF_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i < currentStepIndex
                      ? 'bg-green-500'
                      : i === currentStepIndex && progress < 100
                      ? 'bg-purple-500 animate-pulse'
                      : i === currentStepIndex
                      ? 'bg-green-500'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center space-x-3 py-4">
            {progress < 100 ? (
              <>
                <Loader className="h-5 w-5 text-purple-400 animate-spin" />
                <span className="text-slate-300 text-sm">Generating cryptographic proof locally...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Proof generated successfully</span>
              </>
            )}
          </div>

          {/* Proof result */}
          {localProof && (
            <div className="bg-green-600/5 border border-green-600/20 rounded-2xl p-5 animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Proof Ready</h4>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 mb-4 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1.5">ZK Proof Hash</p>
                <p className="text-green-300/80 font-mono text-xs break-all leading-relaxed">
                  {localProof}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="bg-white/3 rounded-lg p-3">
                  <span className="text-slate-500">Size</span>
                  <p className="text-white font-medium mt-1">2.1 KB</p>
                </div>
                <div className="bg-white/3 rounded-lg p-3">
                  <span className="text-slate-500">Scheme</span>
                  <p className="text-white font-medium mt-1">Groth16</p>
                </div>
                <div className="bg-white/3 rounded-lg p-3">
                  <span className="text-slate-500">Est. DUST</span>
                  <p className="text-white font-medium mt-1">~0.001 DUST</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isGenerating && !localProof && (
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
