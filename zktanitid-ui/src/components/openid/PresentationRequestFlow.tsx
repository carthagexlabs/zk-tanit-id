import React, { useState } from 'react';
import { ArrowLeft, Send, Zap, Copy, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useOpenID } from '../../hooks/useOpenID';
import { PidCredentialStore } from './PidCredentialStore';
import { ConsentScreen } from './ConsentScreen';
import { createDemoAuthorizationRequestUri } from '../../services/openid/oid4vp';

interface PresentationRequestFlowProps {
  onBack: () => void;
}

export function PresentationRequestFlow({ onBack }: PresentationRequestFlowProps) {
  const {
    consent,
    currentRequest,
    isProcessing,
    error,
    lastResponse,
    matchedCredential,
    handleAuthorizationRequest,
    updateSelectedFields,
    submitPresentation,
    cancelPresentation,
    clearError,
  } = useOpenID();

  const [requestUri, setRequestUri] = useState('');
  const [copied, setCopied] = useState(false);

  // Determine current step
  const step = lastResponse ? 3 : consent && matchedCredential ? 2 : 1;

  const handleSubmitUri = () => {
    if (!requestUri.trim()) return;
    handleAuthorizationRequest(requestUri.trim());
  };

  const handleTryDemo = () => {
    const demoUri = createDemoAuthorizationRequestUri();
    setRequestUri(demoUri);
    handleAuthorizationRequest(demoUri);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/15 rounded-xl border border-white/20 text-slate-300 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">EU PID Presentation</h2>
            <p className="text-slate-400 text-sm">
              OpenID4VP — Selective Disclosure with SD-JWT-VC
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center space-x-2">
          {[
            { num: 1, label: 'Request' },
            { num: 2, label: 'Consent' },
            { num: 3, label: 'Response' },
          ].map(({ num, label }) => (
            <React.Fragment key={num}>
              {num > 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step >= num ? 'bg-purple-500' : 'bg-white/10'
                  } transition-colors duration-300`}
                />
              )}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= num
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {step > num ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    num
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step >= num ? 'text-purple-300' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-start space-x-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 text-xs underline mt-1 hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Request Input + Credential Store */}
        {step === 1 && (
          <div className="space-y-6">
            <PidCredentialStore />

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span>Authorization Request</span>
              </h3>
              <p className="text-slate-400 text-sm">
                Paste an <code className="text-purple-300 bg-purple-600/20 px-1 rounded">openid4vp://</code> URI
                from a verifier, or try the demo request.
              </p>

              <textarea
                value={requestUri}
                onChange={(e) => setRequestUri(e.target.value)}
                placeholder="openid4vp://?response_type=vp_token&client_id=..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 resize-none"
              />

              <div className="flex space-x-3">
                <button
                  onClick={handleTryDemo}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 text-sm font-medium transition-all duration-300"
                >
                  <Zap className="h-4 w-4" />
                  <span>Try Demo Request</span>
                </button>
                <button
                  onClick={handleSubmitUri}
                  disabled={!requestUri.trim()}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Consent */}
        {step === 2 && consent && matchedCredential && (
          <ConsentScreen
            consent={consent}
            credential={matchedCredential}
            isProcessing={isProcessing}
            onToggleField={updateSelectedFields}
            onApprove={submitPresentation}
            onDeny={cancelPresentation}
          />
        )}

        {/* Step 3: Response */}
        {step === 3 && lastResponse && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">
                Presentation Created
              </h3>
              <p className="text-slate-300 text-sm">
                Your VP Token has been generated with selective disclosure.
              </p>
            </div>

            {/* VP Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-medium">VP Token (SD-JWT)</label>
                <button
                  onClick={() => handleCopy(lastResponse.vp_token)}
                  className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/30 rounded-xl p-3 border border-white/10 max-h-32 overflow-y-auto">
                <code className="text-green-300 text-xs break-all font-mono">
                  {lastResponse.vp_token}
                </code>
              </div>
            </div>

            {/* Presentation Submission */}
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">
                Presentation Submission
              </label>
              <div className="bg-black/30 rounded-xl p-3 border border-white/10 max-h-40 overflow-y-auto">
                <pre className="text-blue-300 text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(lastResponse.presentation_submission, null, 2)}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleCopy(JSON.stringify(lastResponse, null, 2))}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-slate-300 font-medium transition-all duration-300"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Full Response</span>
              </button>
              <button
                onClick={cancelPresentation}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all duration-300"
              >
                <span>New Presentation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
