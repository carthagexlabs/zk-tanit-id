/**
 * EU PID (Person Identification Data) types per ARF v2.8.0 / eIDAS 2.0
 * OID4VP (OpenID for Verifiable Presentations) protocol types
 * SD-JWT-VC credential format types
 */

// ── Verifiable Credential Type identifiers (SD-JWT-VC `vct` claim) ─────────
export const PID_VCT = 'eu.europa.ec.eudi.pid.1' as const;
export const CIN_VCT = 'tn.gov.moi.cin.1' as const;

// ── PID Credential Claims (eu.europa.ec.eudi.pid.1 namespace) ──────────────

/** Mandatory PID attributes per ARF v2.8.0 */
export interface PidMandatoryClaims {
  family_name: string;
  given_name: string;
  birth_date: string; // ISO 8601 (YYYY-MM-DD)
  age_over_18: boolean;
  issuance_date: string; // ISO 8601
  expiry_date: string; // ISO 8601
  issuing_authority: string;
  issuing_country: string; // ISO 3166-1 alpha-2
}

/** Optional PID attributes */
export interface PidOptionalClaims {
  family_name_birth?: string;
  given_name_birth?: string;
  birth_place?: string;
  birth_city?: string;
  birth_state?: string;
  birth_country?: string;
  nationality?: string;
  document_number?: string;
  administrative_number?: string;
  gender?: 'male' | 'female' | 'other';
  age_over_12?: boolean;
  age_over_14?: boolean;
  age_over_16?: boolean;
  age_over_21?: boolean;
  age_over_65?: boolean;
  age_in_years?: number;
  age_birth_year?: number;
  resident_address?: string;
  resident_city?: string;
  resident_postal_code?: string;
  resident_state?: string;
  resident_country?: string;
  portrait?: string; // base64 JPEG
}

/** Full PID credential claims */
export type PidCredentialClaims = PidMandatoryClaims & PidOptionalClaims;

// ── CIN (Carte d'Identité Nationale) Credential Claims ─────────────────────

/** Tunisian CIN attributes */
export interface CinCredentialClaims {
  cin_number: string;
  nom: string;
  prenom: string;
  nom_ar: string;
  prenom_ar: string;
  date_naissance: string; // ISO 8601 (YYYY-MM-DD)
  lieu_naissance: string;
  gouvernorat_naissance: string;
  sexe: 'masculin' | 'féminin';
  nationalite: string;
  etat_civil: 'célibataire' | 'marié(e)' | 'divorcé(e)' | 'veuf(ve)';
  nom_pere: string;
  nom_mere: string;
  adresse: string;
  gouvernorat: string;
  code_postal: string;
  date_delivrance: string; // ISO 8601
  date_expiration: string; // ISO 8601
  autorite_delivrance: string;
}

/** Union of all supported credential claim types */
export type CredentialClaims = PidCredentialClaims | CinCredentialClaims;

// ── SD-JWT-VC Stored Credential ────────────────────────────────────────────

export interface StoredCredential {
  id: string;
  raw: string; // compact SD-JWT string (header.payload.signature~disclosure1~...~)
  vct: string;
  claims: CredentialClaims;
  issuedAt: string;
  expiresAt: string;
  issuer: string;
}

// ── OID4VP Authorization Request ───────────────────────────────────────────

export interface FieldConstraint {
  path: string[]; // JSONPath expressions e.g. ['$.family_name']
  filter?: {
    type: string;
    const?: unknown;
  };
}

export interface InputDescriptor {
  id: string;
  name?: string;
  purpose?: string;
  format?: {
    'vc+sd-jwt'?: {
      'sd-jwt_alg_values'?: string[];
    };
  };
  constraints: {
    fields: FieldConstraint[];
  };
}

export interface PresentationDefinition {
  id: string;
  name?: string;
  purpose?: string;
  input_descriptors: InputDescriptor[];
}

export interface OID4VPAuthorizationRequest {
  response_type: 'vp_token';
  client_id: string;
  client_id_scheme?: 'redirect_uri' | 'x509_san_dns' | 'verifier_attestation' | 'did';
  response_mode?: 'direct_post' | 'fragment';
  response_uri?: string;
  redirect_uri?: string;
  nonce: string;
  state?: string;
  presentation_definition: PresentationDefinition;
}

// ── OID4VP Authorization Response ──────────────────────────────────────────

export interface DescriptorMap {
  id: string;
  format: string;
  path: string;
}

export interface PresentationSubmission {
  id: string;
  definition_id: string;
  descriptor_map: DescriptorMap[];
}

export interface OID4VPAuthorizationResponse {
  vp_token: string;
  presentation_submission: PresentationSubmission;
  state?: string;
}

// ── Consent ────────────────────────────────────────────────────────────────

export interface PresentationConsent {
  verifierName: string;
  verifierPurpose?: string;
  requestedFields: {
    path: string;
    label: string;
    required: boolean;
    selected: boolean;
  }[];
}
