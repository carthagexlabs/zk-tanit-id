/**
 * SD-JWT-VC operations using @sd-jwt/sd-jwt-vc + Web Crypto API (ES256 / P-256)
 *
 * This module handles issuing, presenting, and verifying SD-JWT-VC credentials
 * for the EU PID (eu.europa.ec.eudi.pid.1) use case.
 */
import { SDJwtVcInstance } from '@sd-jwt/sd-jwt-vc';
import type { DisclosureFrame, PresentationFrame } from '@sd-jwt/types';
import { base64urlEncode } from '@sd-jwt/utils';
import { PID_VCT, type PidCredentialClaims } from '../../types/eupid';

// ── Key types ──────────────────────────────────────────────────────────────

interface DemoKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

// ── Demo keypair (software-backed, NOT hardware-bound) ─────────────────────

let _demoKeyPair: DemoKeyPair | null = null;

export async function getDemoKeyPair(): Promise<DemoKeyPair> {
  if (_demoKeyPair) return _demoKeyPair;

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  );

  _demoKeyPair = keyPair as DemoKeyPair;
  return _demoKeyPair;
}

// ── Crypto helpers ─────────────────────────────────────────────────────────

async function createSigner(privateKey: CryptoKey) {
  return async (data: string): Promise<string> => {
    const encoded = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      encoded,
    );
    return uint8ArrayToBase64Url(new Uint8Array(signature));
  };
}

async function createVerifier(publicKey: CryptoKey) {
  return async (data: string, signatureB64: string): Promise<boolean> => {
    const encoded = new TextEncoder().encode(data);
    const signature = base64UrlToUint8Array(signatureB64);
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signature,
      encoded,
    );
  };
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

async function sha256Hasher(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return uint8ArrayToBase64Url(new Uint8Array(hash));
}

// ── SD-JWT-VC Instance factory ─────────────────────────────────────────────

async function createSdJwtVcInstance(): Promise<SDJwtVcInstance> {
  const keyPair = await getDemoKeyPair();
  const signer = await createSigner(keyPair.privateKey);
  const verifier = await createVerifier(keyPair.publicKey);

  return new SDJwtVcInstance({
    signer,
    verifier,
    signAlg: 'ES256',
    hasher: sha256Hasher,
    hashAlg: 'sha-256',
    saltGenerator: async () => {
      const salt = new Uint8Array(16);
      crypto.getRandomValues(salt);
      return uint8ArrayToBase64Url(salt);
    },
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Issue a demo PID SD-JWT-VC with all PID claims selectively disclosable.
 */
export async function issueDemoPidCredential(
  claims: PidCredentialClaims,
): Promise<string> {
  const instance = await createSdJwtVcInstance();

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    vct: PID_VCT,
    iss: 'https://demo.zktanit.id/issuer',
    iat: now,
    nbf: now,
    exp: now + 365 * 24 * 60 * 60, // 1 year
    ...claims,
  };

  // Mark all PID claim fields as selectively disclosable
  const disclosureFrame: DisclosureFrame<typeof payload> = {
    _sd: [
      'family_name',
      'given_name',
      'birth_date',
      'age_over_18',
      'issuance_date',
      'expiry_date',
      'issuing_authority',
      'issuing_country',
    ] as unknown as string[],
  } as DisclosureFrame<typeof payload>;

  // Add optional claims to disclosure frame if present
  const optionalFields = [
    'nationality', 'document_number', 'administrative_number',
    'gender', 'age_over_12', 'age_over_14', 'age_over_16',
    'age_over_21', 'age_over_65', 'age_in_years', 'age_birth_year',
    'resident_address', 'resident_city', 'resident_postal_code',
    'resident_state', 'resident_country', 'birth_place', 'birth_city',
    'birth_state', 'birth_country',
  ];

  for (const field of optionalFields) {
    if (field in claims) {
      (disclosureFrame._sd as string[]).push(field);
    }
  }

  const credential = await instance.issue(payload, disclosureFrame);
  return credential;
}

/**
 * Create a selective disclosure presentation from a stored SD-JWT-VC.
 * Only reveals the fields listed in `selectedFields`.
 */
export async function createPresentation(
  credential: string,
  selectedFields: string[],
  nonce: string,
  audience?: string,
): Promise<string> {
  const instance = await createSdJwtVcInstance();

  // Build presentation frame — true = disclose, omitted = hidden
  const presentationFrame: PresentationFrame<Record<string, boolean>> = {};
  for (const field of selectedFields) {
    presentationFrame[field] = true;
  }

  const kbOptions = audience
    ? {
        kb: {
          payload: {
            aud: audience,
            nonce,
            iat: Math.floor(Date.now() / 1000),
          },
        },
      }
    : undefined;

  const presentation = await instance.present(
    credential,
    presentationFrame,
    kbOptions,
  );
  return presentation;
}

/**
 * Verify an SD-JWT-VC presentation and return the disclosed claims.
 */
export async function verifyPresentation(
  presentation: string,
): Promise<{ valid: boolean; claims: Record<string, unknown> }> {
  try {
    const instance = await createSdJwtVcInstance();
    const result = await instance.verify(presentation);
    return {
      valid: true,
      claims: result.payload as Record<string, unknown>,
    };
  } catch {
    return { valid: false, claims: {} };
  }
}

/**
 * Decode an SD-JWT-VC credential into its claims without verification.
 * Parses the JWT payload to extract all embedded + disclosed claims.
 */
export function decodeCredential(raw: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  disclosureCount: number;
} {
  const parts = raw.split('~');
  const jwtPart = parts[0];
  const disclosures = parts.slice(1).filter((d) => d.length > 0);

  const [headerB64, payloadB64] = jwtPart.split('.');

  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

  // Decode individual disclosures to extract claim values
  for (const disc of disclosures) {
    try {
      const decoded = JSON.parse(atob(disc.replace(/-/g, '+').replace(/_/g, '/')));
      // SD-JWT disclosure format: [salt, claim_name, claim_value]
      if (Array.isArray(decoded) && decoded.length >= 3) {
        payload[decoded[1]] = decoded[2];
      }
    } catch {
      // Skip malformed disclosures
    }
  }

  return { header, payload, disclosureCount: disclosures.length };
}

// Re-export for convenience
export { base64urlEncode };
