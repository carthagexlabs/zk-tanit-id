import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import type { PresentationConsent, StoredCredential } from '../../types/eupid';

interface ConsentScreenProps {
  consent: PresentationConsent;
  credential: StoredCredential;
  isProcessing: boolean;
  onToggleField: (path: string, selected: boolean) => void;
  onApprove: () => void;
  onDeny: () => void;
}

export function ConsentScreen({
  consent,
  credential,
  isProcessing,
  onToggleField,
  onApprove,
  onDeny,
}: ConsentScreenProps) {
  const selectedCount = consent.requestedFields.filter((f) => f.selected).length;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-6">
      {/* Verifier identity */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto">
          <Shield className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-white font-semibold text-lg">Share Your Identity</h3>
        <p className="text-slate-300 text-sm">
          <span className="text-purple-300 font-medium">{consent.verifierName}</span>
          {' '}is requesting access to your credentials
        </p>
        {consent.verifierPurpose && (
          <p className="text-slate-400 text-xs italic">{consent.verifierPurpose}</p>
        )}
      </div>

      {/* Credential being used */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <p className="text-slate-400 text-xs mb-1">Using credential</p>
        <p className="text-white text-sm font-medium">
          {credential.claims.given_name} {credential.claims.family_name} — EU PID
        </p>
      </div>

      {/* Field selection */}
      <div className="space-y-2">
        <p className="text-slate-300 text-sm font-medium">
          Requested attributes ({selectedCount}/{consent.requestedFields.length} selected)
        </p>
        <div className="space-y-1">
          {consent.requestedFields.map((field) => (
            <label
              key={field.path}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                field.selected
                  ? 'bg-purple-600/10 border-purple-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={field.selected}
                  onChange={(e) => onToggleField(field.path, e.target.checked)}
                  disabled={field.required}
                  className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 disabled:opacity-70"
                />
                <div>
                  <span className="text-white text-sm">{field.label}</span>
                  {field.required && (
                    <span className="ml-2 text-xs text-amber-400/80">(required)</span>
                  )}
                </div>
              </div>
              {field.selected && (
                <span className="text-slate-400 text-xs font-mono">
                  {String(credential.claims[field.path as keyof typeof credential.claims] ?? '—')}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start space-x-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-amber-300/80 text-xs">
          Only selected attributes will be shared. The verifier will not see any other data from your credential.
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={onDeny}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-red-500/30 rounded-xl text-slate-300 hover:text-red-300 font-medium transition-all duration-300 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          <span>Deny</span>
        </button>
        <button
          onClick={onApprove}
          disabled={isProcessing || selectedCount === 0}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span>{isProcessing ? 'Creating Presentation...' : 'Approve & Share'}</span>
        </button>
      </div>
    </div>
  );
}
