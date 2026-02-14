/**
 * OID4VP (OpenID for Verifiable Presentations) — minimal holder-side protocol.
 *
 * Handles parsing authorization requests, matching credentials,
 * and building authorization responses with VP tokens.
 */
import type {
  OID4VPAuthorizationRequest,
  OID4VPAuthorizationResponse,
  PresentationSubmission,
  StoredCredential,
  InputDescriptor,
} from '../../types/eupid';
import { PID_VCT } from '../../types/eupid';

// ── Parse Authorization Request ────────────────────────────────────────────

/**
 * Parse an openid4vp:// URI into a structured authorization request.
 *
 * Supports inline parameters only (request_uri dereferencing deferred).
 * Example: openid4vp://?response_type=vp_token&client_id=...&nonce=...&presentation_definition={...}
 */
export function parseAuthorizationRequest(uri: string): OID4VPAuthorizationRequest {
  // Strip protocol prefix
  let queryString = uri;
  if (uri.startsWith('openid4vp://')) {
    queryString = uri.substring('openid4vp://'.length);
  }
  if (queryString.startsWith('?')) {
    queryString = queryString.substring(1);
  }

  const params = new URLSearchParams(queryString);

  const responseType = params.get('response_type');
  if (responseType !== 'vp_token') {
    throw new Error(`Unsupported response_type: ${responseType}. Expected "vp_token".`);
  }

  const clientId = params.get('client_id');
  if (!clientId) {
    throw new Error('Missing required parameter: client_id');
  }

  const nonce = params.get('nonce');
  if (!nonce) {
    throw new Error('Missing required parameter: nonce');
  }

  const pdRaw = params.get('presentation_definition');
  if (!pdRaw) {
    throw new Error('Missing required parameter: presentation_definition');
  }

  let presentationDefinition;
  try {
    presentationDefinition = JSON.parse(pdRaw);
  } catch {
    throw new Error('Invalid presentation_definition: not valid JSON');
  }

  return {
    response_type: 'vp_token',
    client_id: clientId,
    client_id_scheme: (params.get('client_id_scheme') as OID4VPAuthorizationRequest['client_id_scheme']) || undefined,
    response_mode: (params.get('response_mode') as OID4VPAuthorizationRequest['response_mode']) || undefined,
    response_uri: params.get('response_uri') || undefined,
    redirect_uri: params.get('redirect_uri') || undefined,
    nonce,
    state: params.get('state') || undefined,
    presentation_definition: presentationDefinition,
  };
}

// ── Match Credentials ──────────────────────────────────────────────────────

/**
 * Filter stored credentials that match the input descriptors of a request.
 * Currently matches on VCT (credential type).
 */
export function matchCredentials(
  request: OID4VPAuthorizationRequest,
  credentials: StoredCredential[],
): StoredCredential[] {
  const matched: StoredCredential[] = [];

  for (const descriptor of request.presentation_definition.input_descriptors) {
    // Check format constraint — must support vc+sd-jwt
    const format = descriptor.format;
    if (format && !format['vc+sd-jwt']) {
      continue;
    }

    for (const cred of credentials) {
      // Match on VCT if any field constrains on vct
      const vctConstraint = descriptor.constraints.fields.find((f) =>
        f.path.some((p) => p === '$.vct'),
      );

      if (vctConstraint?.filter?.const) {
        if (cred.vct === vctConstraint.filter.const) {
          matched.push(cred);
        }
      } else {
        // No VCT filter — check if credential has the requested fields
        const hasAllFields = descriptor.constraints.fields.every((field) =>
          field.path.some((p) => {
            const claimName = p.replace('$.', '');
            return claimName in cred.claims;
          }),
        );
        if (hasAllFields) {
          matched.push(cred);
        }
      }
    }
  }

  // Deduplicate
  return [...new Map(matched.map((c) => [c.id, c])).values()];
}

// ── Extract Requested Fields ───────────────────────────────────────────────

/**
 * Extract the list of requested PID field names from a request's input descriptors.
 */
export function extractRequestedFields(
  request: OID4VPAuthorizationRequest,
): { path: string; required: boolean }[] {
  const fields: { path: string; required: boolean }[] = [];

  for (const descriptor of request.presentation_definition.input_descriptors) {
    for (const field of descriptor.constraints.fields) {
      for (const path of field.path) {
        const claimName = path.replace('$.', '');
        // Skip SD-JWT metadata fields
        if (['vct', 'iss', 'iat', 'exp', 'nbf', 'cnf'].includes(claimName)) continue;

        if (!fields.some((f) => f.path === claimName)) {
          fields.push({
            path: claimName,
            // If there's a filter constraint, treat as required
            required: !!field.filter,
          });
        }
      }
    }
  }

  return fields;
}

// ── Build Authorization Response ───────────────────────────────────────────

/**
 * Build an OID4VP authorization response with the VP token and presentation submission.
 */
export function buildAuthorizationResponse(
  request: OID4VPAuthorizationRequest,
  vpToken: string,
): OID4VPAuthorizationResponse {
  const presentationSubmission: PresentationSubmission = {
    id: `ps-${crypto.randomUUID()}`,
    definition_id: request.presentation_definition.id,
    descriptor_map: request.presentation_definition.input_descriptors.map(
      (desc: InputDescriptor) => ({
        id: desc.id,
        format: 'vc+sd-jwt',
        path: '$',
      }),
    ),
  };

  return {
    vp_token: vpToken,
    presentation_submission: presentationSubmission,
    state: request.state,
  };
}

// ── Demo Request Factory ───────────────────────────────────────────────────

/**
 * Create a demo OID4VP authorization request URI simulating a bank verifier
 * requesting basic PID attributes.
 */
export function createDemoAuthorizationRequestUri(): string {
  const pd = {
    id: 'demo-bank-kyc-1',
    name: 'Bank KYC Verification',
    purpose: 'Verify your identity for account opening',
    input_descriptors: [
      {
        id: 'eu-pid-basic',
        name: 'EU Person Identification Data',
        purpose: 'Basic identity verification',
        format: { 'vc+sd-jwt': { 'sd-jwt_alg_values': ['ES256'] } },
        constraints: {
          fields: [
            { path: ['$.vct'], filter: { type: 'string', const: PID_VCT } },
            { path: ['$.family_name'] },
            { path: ['$.given_name'] },
            { path: ['$.age_over_18'] },
          ],
        },
      },
    ],
  };

  const params = new URLSearchParams({
    response_type: 'vp_token',
    client_id: 'https://demo-bank.example.com',
    nonce: crypto.randomUUID(),
    state: `session-${Date.now()}`,
    response_mode: 'direct_post',
    presentation_definition: JSON.stringify(pd),
  });

  return `openid4vp://?${params.toString()}`;
}
