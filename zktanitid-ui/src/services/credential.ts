import type { SdJwtCredential, SelectedClaim } from '../types/credential';

export type { Disclosure, KeyBindingJwt, SdJwtCredential, SelectedClaim } from '../types/credential';

/**
 * Load the mock CIN SD-JWT VC credential from public demo directory
 */
export async function loadCinCredential(): Promise<SdJwtCredential> {
  const res = await fetch('/demo/credentials/cin-credential.sd-jwt.json');
  const data = await res.json();
  return data as SdJwtCredential;
}

/**
 * Parse a compact SD-JWT VC string into its components.
 * Format: <issuer-JWT>~<disclosure1>~...~<disclosureN>~<KB-JWT>
 */
export function parseCompactSdJwt(compact: string): {
  issuerJwt: string;
  disclosures: string[];
  kbJwt: string | null;
} {
  const parts = compact.split('~');
  const issuerJwt = parts[0];
  const kbJwt = parts.length > 1 && parts[parts.length - 1].includes('.')
    ? parts[parts.length - 1]
    : null;
  const disclosures = parts.slice(1, kbJwt ? parts.length - 1 : parts.length).filter(Boolean);
  return { issuerJwt, disclosures, kbJwt };
}

/**
 * Extract all selectively disclosable claims from the credential
 */
export function extractDisclosableClaims(credential: SdJwtCredential): SelectedClaim[] {
  return credential.disclosures.map((d) => ({
    claim_name: d.claim_name,
    claim_value: d.claim_value,
    disclosed: false,
  }));
}

/**
 * Get the always-visible (non-SD) boolean claims, including nested structures like age_equal_or_over
 */
export function extractPublicClaims(credential: SdJwtCredential): Record<string, boolean> {
  const claims = credential.payload.verified_claims.claims;
  const publicClaims: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(claims)) {
    if (typeof value === 'boolean') {
      publicClaims[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (typeof subValue === 'boolean') {
          publicClaims[`${key}.${subKey}`] = subValue;
        }
      }
    }
  }
  return publicClaims;
}

/**
 * Build the private inputs for the Compact contract from selected disclosures
 */
export function buildPrivateInputs(
  credential: SdJwtCredential,
  selectedClaims: SelectedClaim[]
): {
  privateInputs: Record<string, string | number | boolean>;
  disclosedClaims: string[];
  issuer: string;
  subject: string;
} {
  const privateInputs: Record<string, string | number | boolean> = {};
  const disclosedClaims: string[] = [];

  for (const claim of selectedClaims) {
    if (claim.disclosed) {
      privateInputs[claim.claim_name] = claim.claim_value;
      disclosedClaims.push(claim.claim_name);
    }
  }

  return {
    privateInputs,
    disclosedClaims,
    issuer: credential.payload.iss,
    subject: credential.payload.sub,
  };
}

/**
 * Get credential metadata for display
 */
export function getCredentialMetadata(credential: SdJwtCredential) {
  const evidence = credential.payload.verified_claims.verification.evidence[0];
  return {
    issuer: credential.payload.iss,
    subject: credential.payload.sub,
    format: credential.format,
    algorithm: credential.header.alg,
    credentialType: credential.payload.vct,
    issuedAt: new Date(credential.payload.iat * 1000).toLocaleDateString(),
    expiresAt: new Date(credential.payload.exp * 1000).toLocaleDateString(),
    notBefore: new Date(credential.payload.nbf * 1000).toLocaleDateString(),
    jwtId: credential.payload.jti,
    statusIndex: credential.payload.status.idx,
    statusListUri: credential.payload.status.uri,
    trustFramework: credential.payload.verified_claims.verification.trust_framework,
    assuranceLevel: credential.payload.verified_claims.verification.assurance_level,
    documentType: evidence?.document?.type ?? 'unknown',
    documentIssuer: evidence?.document?.issuer?.name ?? 'unknown',
    documentCountry: evidence?.document?.issuer?.country ?? 'unknown',
    hasKeyBinding: !!credential.kb_jwt,
  };
}
