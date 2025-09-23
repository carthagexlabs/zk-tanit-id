import React from "react";
import {
  CheckCircle,
  Shield,
  ExternalLink,
  RotateCcw,
  Download,
} from "lucide-react";

interface UserData {
  dateOfBirth: string;
  nic: string;
  education: string;
  verificationClaim: string;
}

interface VerificationCompleteStepProps {
  userData: UserData;
  onReset: () => void;
}

export function VerificationCompleteStep({
  userData,
  onReset,
}: VerificationCompleteStepProps) {
  const getClaimText = () => {
    switch (userData.verificationClaim) {
      case "age_over_18":
        return "User is over 18 years old";
      case "age_over_21":
        return "User is over 21 years old";
      case "valid_nic":
        return "User has a valid National ID";
      case "education_level":
        return `User has completed ${userData.education?.replace(
          "_",
          " "
        )} education`;
      default:
        return "User claim is valid";
    }
  };

  const generateCertificate = () => {
    const verificationDate = new Date().toLocaleString();
    const certificateContent = `
ZERO KNOWLEDGE PROOF VERIFICATION CERTIFICATE
===========================================

Verification ID: ${mockVerificationId}
Date: ${verificationDate}

VERIFIED CLAIM
-------------
${getClaimText()}

BLOCKCHAIN RECORD
----------------
Network: Midnight Testnet
Transaction Hash: ${mockTxHash}
Block Height: #2,847,592

PRIVACY GUARANTEES
-----------------
✓ No personal data stored on blockchain
✓ Zero-knowledge proof mathematically verified
✓ Identity claim cryptographically proven
✓ Fully decentralized verification process

This certificate confirms that a zero-knowledge proof was successfully 
generated and verified on the blockchain, proving the above claim 
without revealing any underlying personal information.
    `.trim();

    const blob = new Blob([certificateContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zk-verification-${mockVerificationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  const mockVerificationId = `zk_verify_${Math.random()
    .toString(36)
    .substring(2, 15)}`;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-400" />
        </div>

        <h3 className="text-3xl font-bold text-white mb-3">
          Verification Complete!
        </h3>
        <p className="text-slate-300 text-lg">
          Your identity has been successfully verified using zero-knowledge
          proofs.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-green-600/10 border border-green-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-green-400" />
            <h4 className="text-lg font-semibold text-green-400">
              Verification Result
            </h4>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
            <p className="text-green-300 font-medium text-lg mb-2">
              ✓ {getClaimText()}
            </p>
            <p className="text-slate-400 text-sm">
              Verified without revealing: Date of Birth, NIC Number, or other
              sensitive information
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Verification ID:</span>
              <p className="text-white font-mono text-xs mt-1 truncate">
                {mockVerificationId}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Verified at:</span>
              <p className="text-white mt-1">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            Blockchain Record
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Network:</span>
              <span className="text-white font-medium">Midnight Testnet</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Block Height:</span>
              <span className="text-white font-medium">#2,847,592</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gas Used:</span>
              <span className="text-white font-medium">21,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transaction Hash:</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono text-sm truncate max-w-32">
                  {mockTxHash.substring(0, 20)}...
                </span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-600/30 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-3">
            Privacy Guaranteed
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">
                No personal data stored on blockchain
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">
                Zero-knowledge proof mathematically verified
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">
                Identity claim cryptographically proven
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">
                Fully decentralized verification process
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Verify Another Identity</span>
        </button>

        <button
          onClick={generateCertificate}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
        >
          <Download className="h-5 w-5" />
          <span>Download Certificate</span>
        </button>
      </div>
    </div>
  );
}
