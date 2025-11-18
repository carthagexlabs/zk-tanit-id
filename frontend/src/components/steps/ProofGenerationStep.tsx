import React, { useState, useEffect } from 'react';
import { Shield, Zap, CheckCircle, Loader, ArrowLeft } from 'lucide-react';

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
}

export function ProofGenerationStep({ userData, onNext, onBack }: ProofGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [proofData, setProofData] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) return;

    const generateProof = async () => {
      const steps = [
        'Initializing zero-knowledge circuit',
        'Computing witness values',
        'Generating cryptographic commitments',
        'Creating proof elements',
        'Optimizing proof size',
        'Finalizing zero-knowledge proof'
      ];

      for (let i = 0; i <= steps.length; i++) {
        setProgress((i / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Simulate proof generation
      const mockProof = `zk_proof_${Math.random().toString(36).substring(2, 15)}`;
      setProofData(mockProof);
      
      setTimeout(() => {
        onNext();
      }, 2000);
    };

    generateProof();
  }, [isGenerating, onNext]);

  const getClaimText = () => {
    switch (userData.verificationClaim) {
      case 'age_over_18':
        return 'I am over 18 years old';
      case 'age_over_21':
        return 'I am over 21 years old';
      case 'valid_nic':
        return 'I have a valid National ID';
      case 'education_level':
        return `I have completed ${userData.education?.replace('_', ' ')} education`;
      default:
        return 'My claim is valid';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-3">Zero-Knowledge Proof Generation</h3>
        <p className="text-slate-300">
          Creating a cryptographic proof that validates your claim without revealing sensitive information.
        </p>
      </div>

      {!isGenerating && !proofData ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-purple-400" />
          </div>
          
          <h4 className="text-xl font-semibold text-white mb-3">Ready to Generate Proof</h4>
          
          <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-medium text-white">Claim to Prove</span>
            </div>
            <p className="text-purple-300 font-medium text-lg">"{getClaimText()}"</p>
            <p className="text-slate-400 text-sm mt-2">
              Without revealing: {userData.dateOfBirth ? 'Date of Birth' : ''} 
              {userData.dateOfBirth && userData.nic ? ', ' : ''}
              {userData.nic ? 'NIC Number' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setIsGenerating(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
          >
            Generate Zero-Knowledge Proof
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300">Generation Progress</span>
              <span className="text-purple-400 font-medium">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {progress < 100 ? (
                <Loader className="h-5 w-5 text-purple-400 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
              <span className="text-sm text-slate-400">
                {progress < 100 ? 'Generating cryptographic proof...' : 'Proof generated successfully!'}
              </span>
            </div>
          </div>

          {proofData && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h4 className="text-lg font-semibold text-green-400">Proof Generated Successfully</h4>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">Zero-Knowledge Proof Hash:</p>
                <p className="text-green-300 font-mono text-sm break-all">
                  {proofData}...abc123def456
                </p>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Proof Size:</span>
                  <span className="text-white ml-2 font-medium">2.1 KB</span>
                </div>
                <div>
                  <span className="text-slate-400">Verification Gas:</span>
                  <span className="text-white ml-2 font-medium">~0.001 NIGHT</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isGenerating && !proofData && (
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