import { describe, it, expect } from 'vitest';
import {
  parseAuthorizationRequest,
  matchCredentials,
  extractRequestedFields,
  buildAuthorizationResponse,
  createDemoAuthorizationRequestUri,
  createDemoCinAuthorizationRequestUri,
} from '../oid4vp';
import type { StoredCredential, OID4VPAuthorizationRequest } from '../../../types/eupid';
import { PID_VCT } from '../../../types/eupid';
import { createDemoPidClaims } from '../pid-credential';

// Helper to create a test credential
function makeTestCredential(overrides?: Partial<StoredCredential>): StoredCredential {
  return {
    id: 'test-cred-1',
    raw: 'eyJhbGciOiJFUzI1NiJ9.eyJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSJ9.sig~disc1~',
    vct: PID_VCT,
    claims: createDemoPidClaims(),
    issuedAt: '2025-01-15',
    expiresAt: '2030-01-15',
    issuer: 'https://demo.zktanit.id/issuer',
    ...overrides,
  };
}

describe('OID4VP protocol', () => {
  describe('parseAuthorizationRequest', () => {
    it('should parse a valid openid4vp:// URI', () => {
      const pd = {
        id: 'test-pd',
        input_descriptors: [
          {
            id: 'pid-1',
            constraints: {
              fields: [{ path: ['$.family_name'] }],
            },
          },
        ],
      };

      const uri = `openid4vp://?response_type=vp_token&client_id=https://example.com&nonce=abc123&presentation_definition=${encodeURIComponent(JSON.stringify(pd))}`;

      const request = parseAuthorizationRequest(uri);
      expect(request.response_type).toBe('vp_token');
      expect(request.client_id).toBe('https://example.com');
      expect(request.nonce).toBe('abc123');
      expect(request.presentation_definition.id).toBe('test-pd');
      expect(request.presentation_definition.input_descriptors).toHaveLength(1);
    });

    it('should throw on missing response_type', () => {
      const uri = 'openid4vp://?client_id=x&nonce=y&presentation_definition={}';
      expect(() => parseAuthorizationRequest(uri)).toThrow('response_type');
    });

    it('should throw on missing client_id', () => {
      const uri = 'openid4vp://?response_type=vp_token&nonce=y&presentation_definition={}';
      expect(() => parseAuthorizationRequest(uri)).toThrow('client_id');
    });

    it('should throw on missing nonce', () => {
      const uri = 'openid4vp://?response_type=vp_token&client_id=x&presentation_definition={}';
      expect(() => parseAuthorizationRequest(uri)).toThrow('nonce');
    });

    it('should throw on invalid JSON in presentation_definition', () => {
      const uri = 'openid4vp://?response_type=vp_token&client_id=x&nonce=y&presentation_definition=not-json';
      expect(() => parseAuthorizationRequest(uri)).toThrow('not valid JSON');
    });

    it('should parse optional parameters', () => {
      const pd = JSON.stringify({ id: 'x', input_descriptors: [] });
      const uri = `openid4vp://?response_type=vp_token&client_id=https://bank.com&nonce=n1&state=s1&response_mode=direct_post&presentation_definition=${encodeURIComponent(pd)}`;

      const request = parseAuthorizationRequest(uri);
      expect(request.state).toBe('s1');
      expect(request.response_mode).toBe('direct_post');
    });
  });

  describe('matchCredentials', () => {
    it('should match credentials by VCT filter', () => {
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
              constraints: {
                fields: [
                  {
                    path: ['$.vct'],
                    filter: { type: 'string', const: PID_VCT },
                  },
                  { path: ['$.family_name'] },
                ],
              },
            },
          ],
        },
      };

      const creds = [makeTestCredential()];
      const matched = matchCredentials(request, creds);
      expect(matched).toHaveLength(1);
      expect(matched[0].id).toBe('test-cred-1');
    });

    it('should not match credentials with wrong VCT', () => {
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
              constraints: {
                fields: [
                  {
                    path: ['$.vct'],
                    filter: { type: 'string', const: 'some.other.type' },
                  },
                ],
              },
            },
          ],
        },
      };

      const matched = matchCredentials(request, [makeTestCredential()]);
      expect(matched).toHaveLength(0);
    });

    it('should match credentials by field presence when no VCT filter', () => {
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
              constraints: {
                fields: [
                  { path: ['$.family_name'] },
                  { path: ['$.age_over_18'] },
                ],
              },
            },
          ],
        },
      };

      const matched = matchCredentials(request, [makeTestCredential()]);
      expect(matched).toHaveLength(1);
    });

    it('should deduplicate matched credentials', () => {
      const cred = makeTestCredential();
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
              constraints: { fields: [{ path: ['$.family_name'] }] },
            },
            {
              id: 'desc-2',
              constraints: { fields: [{ path: ['$.given_name'] }] },
            },
          ],
        },
      };

      const matched = matchCredentials(request, [cred]);
      expect(matched).toHaveLength(1);
    });
  });

  describe('extractRequestedFields', () => {
    it('should extract PID field names from input descriptors', () => {
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
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
        },
      };

      const fields = extractRequestedFields(request);
      // Should skip $.vct (metadata field)
      expect(fields).toHaveLength(3);
      expect(fields.map((f) => f.path)).toEqual(['family_name', 'given_name', 'age_over_18']);
    });

    it('should mark fields with filter as required', () => {
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
              constraints: {
                fields: [
                  { path: ['$.age_over_18'], filter: { type: 'boolean', const: true } },
                  { path: ['$.family_name'] },
                ],
              },
            },
          ],
        },
      };

      const fields = extractRequestedFields(request);
      const ageField = fields.find((f) => f.path === 'age_over_18');
      const nameField = fields.find((f) => f.path === 'family_name');
      expect(ageField?.required).toBe(true);
      expect(nameField?.required).toBe(false);
    });
  });

  describe('buildAuthorizationResponse', () => {
    it('should build a valid response with vp_token and presentation_submission', () => {
      const request: OID4VPAuthorizationRequest = {
        response_type: 'vp_token',
        client_id: 'test',
        nonce: 'n1',
        state: 'session-1',
        presentation_definition: {
          id: 'pd-1',
          input_descriptors: [
            {
              id: 'desc-1',
              constraints: { fields: [{ path: ['$.family_name'] }] },
            },
          ],
        },
      };

      const response = buildAuthorizationResponse(request, 'mock-vp-token');
      expect(response.vp_token).toBe('mock-vp-token');
      expect(response.state).toBe('session-1');
      expect(response.presentation_submission.definition_id).toBe('pd-1');
      expect(response.presentation_submission.descriptor_map).toHaveLength(1);
      expect(response.presentation_submission.descriptor_map[0].format).toBe('vc+sd-jwt');
      expect(response.presentation_submission.descriptor_map[0].path).toBe('$');
    });
  });

  describe('createDemoAuthorizationRequestUri', () => {
    it('should create a parseable demo URI', () => {
      const uri = createDemoAuthorizationRequestUri();
      expect(uri.startsWith('openid4vp://')).toBe(true);

      const request = parseAuthorizationRequest(uri);
      expect(request.client_id).toBe('https://demo-bank.example.com');
      expect(request.presentation_definition.input_descriptors).toHaveLength(1);
    });
  });

  describe('createDemoCinAuthorizationRequestUri', () => {
    it('should create a parseable CIN demo URI', () => {
      const uri = createDemoCinAuthorizationRequestUri();
      expect(uri.startsWith('openid4vp://')).toBe(true);

      const request = parseAuthorizationRequest(uri);
      expect(request.client_id).toBe('https://demo-admin.gov.tn');
      expect(request.presentation_definition.input_descriptors).toHaveLength(1);
    });

    it('should request CIN-specific fields', () => {
      const uri = createDemoCinAuthorizationRequestUri();
      const request = parseAuthorizationRequest(uri);
      const fields = extractRequestedFields(request);
      const fieldPaths = fields.map((f) => f.path);
      expect(fieldPaths).toContain('cin_number');
      expect(fieldPaths).toContain('nom');
      expect(fieldPaths).toContain('prenom');
      expect(fieldPaths).toContain('date_naissance');
    });
  });
});
