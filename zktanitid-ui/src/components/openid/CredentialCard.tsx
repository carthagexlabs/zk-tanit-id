import { CreditCard, Shield, Clock, User } from 'lucide-react';
import type { StoredCredential, PidCredentialClaims, CinCredentialClaims } from '../../types/eupid';
import { CIN_VCT } from '../../types/eupid';

interface CredentialCardProps {
  credential: StoredCredential;
}

function isCinCredential(claims: StoredCredential['claims']): claims is CinCredentialClaims {
  return 'cin_number' in claims;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const { claims, vct, issuer, expiresAt } = credential;
  const isExpired = new Date(expiresAt) < new Date();
  const isCin = vct === CIN_VCT;

  const disclosableFields = Object.keys(claims).length;

  // Resolve holder name from either credential type
  const holderName = isCinCredential(claims)
    ? `${claims.prenom} ${claims.nom}`
    : `${(claims as PidCredentialClaims).given_name} ${(claims as PidCredentialClaims).family_name}`;

  // Resolve country/origin
  const origin = isCinCredential(claims)
    ? claims.nationalite
    : (claims as PidCredentialClaims).issuing_country;

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/15 ${isCin ? 'hover:border-emerald-500/30' : 'hover:border-purple-500/30'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCin ? 'bg-emerald-600/20' : 'bg-purple-600/20'}`}>
            <CreditCard className={`h-5 w-5 ${isCin ? 'text-emerald-400' : 'text-purple-400'}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              {isCin ? 'Tunisian CIN' : 'EU Person ID'}
            </h3>
            <p className="text-slate-400 text-xs font-mono">{vct}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isExpired
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
        >
          {isExpired ? 'Expired' : 'Valid'}
        </span>
      </div>

      {/* Holder info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-white text-sm">{holderName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300 text-sm">{issuer}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300 text-sm">
            Expires: {expiresAt}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-slate-400 text-xs">
          {disclosableFields} disclosable fields
        </span>
        <span className="text-slate-400 text-xs">
          {origin}
        </span>
      </div>
    </div>
  );
}
