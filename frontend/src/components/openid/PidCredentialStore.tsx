import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useOpenID } from '../../hooks/useOpenID';
import { CredentialCard } from './CredentialCard';

export function PidCredentialStore() {
  const { credentials, isProcessing, loadDemoPidCredential, loadDemoCinCredential } = useOpenID();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Your Credentials</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadDemoPidCredential}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Load Demo PID</span>
          </button>
          <button
            onClick={loadDemoCinCredential}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-emerald-300 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Load Demo CIN</span>
          </button>
        </div>
      </div>

      {credentials.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            No credentials stored yet. Load a demo PID credential to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </div>
      )}
    </div>
  );
}
