import { useState } from 'react';
import { FileJson, Shield, Eye, EyeOff, CheckCircle, Upload, AlertTriangle, Fingerprint, Clock, Building } from 'lucide-react';
import {
  loadCinCredential,
  extractDisclosableClaims,
  extractPublicClaims,
  getCredentialMetadata,
} from '../../../services/credential';
import type { SdJwtCredential, SelectedClaim } from '../../../types/credential';

interface CredentialLoadStepProps {
  onNext: (credential: SdJwtCredential, selectedClaims: SelectedClaim[]) => void;
}

export function CredentialLoadStep({ onNext }: CredentialLoadStepProps) {
  const [credential, setCredential] = useState<SdJwtCredential | null>(null);
  const [claims, setClaims] = useState<SelectedClaim[]>([]);
  const [publicClaims, setPublicClaims] = useState<Record<string, boolean>>({});
  const [metadata, setMetadata] = useState<ReturnType<typeof getCredentialMetadata> | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadCredential = async () => {
    setIsLoading(true);
    // Simulate loading delay for realism
    await new Promise((r) => setTimeout(r, 1200));
    const cred = await loadCinCredential();
    setCredential(cred);
    setClaims(extractDisclosableClaims(cred));
    setPublicClaims(extractPublicClaims(cred));
    setMetadata(getCredentialMetadata(cred));
    setIsLoading(false);
  };

  const toggleClaim = (index: number) => {
    setClaims((prev) =>
      prev.map((c, i) => (i === index ? { ...c, disclosed: !c.disclosed } : c))
    );
  };

  const selectAll = () => {
    setClaims((prev) => prev.map((c) => ({ ...c, disclosed: true })));
  };

  const deselectAll = () => {
    setClaims((prev) => prev.map((c) => ({ ...c, disclosed: false })));
  };

  const selectedCount = claims.filter((c) => c.disclosed).length;
  const canProceed = selectedCount > 0;

  const handleNext = () => {
    if (credential && canProceed) {
      onNext(credential, claims);
    }
  };

  const formatClaimName = (name: string) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Fingerprint className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Load Verifiable Credential</h3>
            <p className="text-slate-400 text-sm">SD-JWT VC — Selective Disclosure</p>
          </div>
        </div>
      </div>

      {!credential ? (
        <div className="text-center py-16">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl rotate-6 transition-transform duration-500 group-hover:rotate-12" />
            <div className="relative w-full h-full bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
              <FileJson className="h-12 w-12 text-purple-400" />
            </div>
          </div>

          <h4 className="text-xl font-semibold text-white mb-2">Import Your CIN Credential</h4>
          <p className="text-slate-400 mb-2 max-w-lg mx-auto">
            Load your Tunisian National ID (CIN) credential issued as an SD-JWT Verifiable Credential.
          </p>
          <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
            Format: <span className="font-mono text-purple-400/80">vc+sd-jwt</span> — You choose which claims to disclose.
          </p>

          <button
            onClick={loadCredential}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-70 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl shadow-purple-500/25 inline-flex items-center space-x-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Parsing SD-JWT VC...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Load Demo CIN Credential</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          {/* Credential Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-2xl p-6 border border-purple-500/20">
            {/* Card background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">Carte d'Identité Nationale</h4>
                    <p className="text-xs text-slate-400 font-mono">{metadata?.credentialType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Valid</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Building className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-500 text-xs">Issuer</span>
                  </div>
                  <p className="text-white text-xs font-medium">{metadata?.documentIssuer}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-500 text-xs">Assurance</span>
                  </div>
                  <p className="text-white text-xs font-medium capitalize">{metadata?.assuranceLevel}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-500 text-xs">Issued</span>
                  </div>
                  <p className="text-white text-xs font-medium">{metadata?.issuedAt}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-500 text-xs">Expires</span>
                  </div>
                  <p className="text-white text-xs font-medium">{metadata?.expiresAt}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4 text-xs text-slate-500">
                <span className="font-mono bg-white/5 px-2 py-1 rounded">{metadata?.format}</span>
                <span className="font-mono bg-white/5 px-2 py-1 rounded">{metadata?.algorithm}</span>
                <span className="font-mono bg-white/5 px-2 py-1 rounded">{metadata?.documentCountry}</span>
              </div>
            </div>
          </div>

          {/* Public Claims (always visible) */}
          <div className="bg-green-600/5 border border-green-600/20 rounded-2xl p-5">
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Public Attestations</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(publicClaims).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 bg-green-600/10 px-3 py-2 rounded-lg border border-green-600/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 text-sm">{formatClaimName(key)}</span>
                  <span className="text-white text-sm font-semibold">{value ? 'True' : 'False'}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">These boolean claims are always visible — no PII exposed.</p>
          </div>

          {/* Selective Disclosure */}
          <div className="bg-purple-600/5 border border-purple-600/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Selective Disclosure</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Toggle claims to feed as <span className="font-mono text-purple-400/80">secret</span> inputs to the Compact contract
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={selectAll} className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded hover:bg-purple-600/10">
                  All
                </button>
                <span className="text-slate-600">|</span>
                <button onClick={deselectAll} className="text-xs text-slate-400 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/5">
                  None
                </button>
                <span className="text-xs text-purple-300 bg-purple-600/20 px-3 py-1 rounded-full ml-2">
                  {selectedCount}/{claims.length}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              {claims.map((claim, index) => (
                <button
                  key={claim.claim_name}
                  onClick={() => toggleClaim(index)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group ${
                    claim.disclosed
                      ? 'bg-purple-600/15 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                      : 'bg-white/3 border border-white/5 hover:border-white/15 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                        claim.disclosed
                          ? 'bg-purple-600 shadow-sm shadow-purple-600/30'
                          : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                      }`}
                    >
                      {claim.disclosed && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${claim.disclosed ? 'text-white' : 'text-slate-400'}`}>
                      {formatClaimName(claim.claim_name)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {claim.disclosed ? (
                      <>
                        <span className="text-purple-300 text-sm font-mono bg-purple-600/10 px-2 py-0.5 rounded">
                          {String(claim.claim_value)}
                        </span>
                        <Eye className="h-4 w-4 text-purple-400" />
                      </>
                    ) : (
                      <>
                        <span className="text-slate-600 text-sm font-mono">••••••••</span>
                        <EyeOff className="h-4 w-4 text-slate-600 group-hover:text-slate-500" />
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy notice */}
          <div className="flex items-start space-x-3 bg-amber-600/10 rounded-xl p-4 border border-amber-600/20">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-medium text-sm">Privacy Guarantee</p>
              <p className="text-amber-200/60 text-sm mt-1">
                Selected claims are processed <span className="text-amber-200/80 font-medium">locally on your device</span>.
                Only a boolean attestation (true/false) is written on-chain — the actual values never leave your browser.
              </p>
            </div>
          </div>

          {/* Raw JSON toggle */}
          <div>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors font-mono"
            >
              {showRawJson ? '▼ Hide' : '▶ Show'} raw SD-JWT payload
            </button>
            {showRawJson && (
              <pre className="mt-3 bg-slate-950/80 rounded-xl p-4 text-xs text-green-400/80 font-mono overflow-x-auto max-h-64 overflow-y-auto border border-slate-800 leading-relaxed">
                {JSON.stringify(credential, null, 2)}
              </pre>
            )}
          </div>

          {/* Continue */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              {selectedCount > 0 && (
                <>Proving: {claims.filter(c => c.disclosed).map(c => formatClaimName(c.claim_name)).join(', ')}</>
              )}
            </p>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/20 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {canProceed
                ? `Continue with ${selectedCount} claim${selectedCount > 1 ? 's' : ''}`
                : 'Select at least one claim'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
