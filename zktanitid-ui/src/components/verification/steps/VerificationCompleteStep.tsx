import {
  CheckCircle,
  Shield,
  ExternalLink,
  RotateCcw,
  Download,
  Copy,
  Link,
  Lock,
} from "lucide-react";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const mockVerificationId = `zk_verify_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
  const verifierLink = `${window.location.origin}/verify/${mockVerificationId}`;

  const getClaimText = () => "Subject has a valid National ID (CIN)";

  const copyVerifierLink = async () => {
    await navigator.clipboard.writeText(verifierLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCertificate = () => {
    const certificateContent = `
ZERO KNOWLEDGE PROOF VERIFICATION CERTIFICATE
===============================================

Verification ID: ${mockVerificationId}
Date: ${new Date().toLocaleString()}

VERIFIED CLAIM
--------------
${getClaimText()}

BLOCKCHAIN RECORD
-----------------
Network: Midnight Testnet
Transaction Hash: ${mockTxHash}
Credential Format: SD-JWT VC (vc+sd-jwt)

PRIVACY GUARANTEES
------------------
[x] No personal data stored on blockchain
[x] Zero-knowledge proof mathematically verified
[x] SD-JWT selective disclosure — only chosen claims proven
[x] Compact contract executed locally (off-chain)
[x] Boolean attestation only written on-chain

VERIFIER LINK
-------------
${verifierLink}

This certificate confirms that a zero-knowledge proof was successfully
generated from an SD-JWT Verifiable Credential and verified on the
Midnight blockchain, proving the above claim without revealing any
underlying personal information.
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

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-full h-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-full flex items-center justify-center border border-green-500/30">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">Verification Complete</h3>
        <p className="text-slate-400">
          Your identity claim has been verified on-chain via zero-knowledge proof.
        </p>
      </div>

      <div className="space-y-5 mb-8">
        {/* Verified claim */}
        <div className="bg-green-600/5 border border-green-600/20 rounded-2xl p-5">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-5 w-5 text-green-400" />
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Verified Attestation</h4>
          </div>
          <p className="text-green-300 font-medium text-lg mb-2">{getClaimText()}</p>
          <p className="text-xs text-slate-500">
            Proven from SD-JWT VC without revealing: Date of Birth, CIN Number, or other PII
          </p>
        </div>

        {/* Blockchain record */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Blockchain Record</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Network</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white font-medium">Midnight Testnet</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Verification ID</span>
              <span className="text-white font-mono text-xs">{mockVerificationId.slice(0, 24)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Transaction</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono text-xs">{mockTxHash.slice(0, 18)}...</span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Credential Format</span>
              <span className="text-white font-mono text-xs">vc+sd-jwt</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Timestamp</span>
              <span className="text-white text-xs">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Verifier link */}
        <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-5">
          <div className="flex items-center space-x-3 mb-3">
            <Link className="h-5 w-5 text-blue-400" />
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Shareable Verifier Link</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Share this link with anyone who needs to verify your attestation — they only see the boolean result.
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-950/60 rounded-lg p-3 border border-slate-800">
              <p className="text-blue-300 font-mono text-xs truncate">{verifierLink}</p>
            </div>
            <button
              onClick={copyVerifierLink}
              className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-1.5 text-xs font-medium ${
                copied
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                  : 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30'
              }`}
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Privacy guarantees */}
        <div className="bg-purple-600/5 border border-purple-600/20 rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Privacy Guarantees</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              'No personal data stored on-chain',
              'ZK proof mathematically verified',
              'SD-JWT selective disclosure used',
              'Compact contract ran locally',
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2 text-slate-400">
                <Lock className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Verify Another</span>
        </button>

        <button
          onClick={generateCertificate}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/20 text-sm"
        >
          <Download className="h-4 w-4" />
          <span>Download Certificate</span>
        </button>
      </div>
    </div>
  );
}
