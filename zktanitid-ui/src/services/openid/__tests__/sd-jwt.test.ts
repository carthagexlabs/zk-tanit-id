import { describe, it, expect, beforeAll } from 'vitest';
import {
  issueDemoPidCredential,
  issueDemoCinCredential,
  createPresentation,
  verifyPresentation,
  decodeCredential,
  getDemoKeyPair,
} from '../sd-jwt';
import { createDemoPidClaims } from '../pid-credential';
import { createDemoCinClaims } from '../cin-credential';

describe('SD-JWT-VC operations', () => {
  let credential: string;

  beforeAll(async () => {
    // Ensure keys are generated once
    await getDemoKeyPair();
  });

  describe('issueDemoPidCredential', () => {
    it('should issue a valid SD-JWT-VC string', async () => {
      const claims = createDemoPidClaims();
      credential = await issueDemoPidCredential(claims);

      expect(credential).toBeDefined();
      expect(typeof credential).toBe('string');
      // SD-JWT format: header.payload.signature~disclosure1~disclosure2~...~
      expect(credential).toContain('~');
      const parts = credential.split('~');
      // At least the JWT part + some disclosures
      expect(parts.length).toBeGreaterThan(1);
    });

    it('should embed the correct VCT in the JWT payload', async () => {
      const decoded = decodeCredential(credential);
      expect(decoded.payload.vct).toBe('eu.europa.ec.eudi.pid.1');
    });

    it('should have disclosures for PID claims', async () => {
      const decoded = decodeCredential(credential);
      // The demo credential has at least 8 mandatory + several optional fields
      expect(decoded.disclosureCount).toBeGreaterThanOrEqual(8);
    });
  });

  describe('decodeCredential', () => {
    it('should decode JWT header and payload', () => {
      const decoded = decodeCredential(credential);
      expect(decoded.header.alg).toBe('ES256');
      expect(decoded.payload.iss).toBe('https://demo.zktanit.id/issuer');
      expect(decoded.payload.iat).toBeDefined();
    });

    it('should include disclosed claims from disclosures', () => {
      const decoded = decodeCredential(credential);
      // After decoding disclosures, PID claims should be present
      expect(decoded.payload.family_name).toBe('Ben Salah');
      expect(decoded.payload.given_name).toBe('Ali');
      expect(decoded.payload.age_over_18).toBe(true);
    });
  });

  describe('issueDemoCinCredential', () => {
    let cinCredential: string;

    it('should issue a valid CIN SD-JWT-VC string', async () => {
      const claims = createDemoCinClaims();
      cinCredential = await issueDemoCinCredential(claims);

      expect(cinCredential).toBeDefined();
      expect(typeof cinCredential).toBe('string');
      expect(cinCredential).toContain('~');
      const parts = cinCredential.split('~');
      expect(parts.length).toBeGreaterThan(1);
    });

    it('should embed the CIN VCT in the JWT payload', async () => {
      const decoded = decodeCredential(cinCredential);
      expect(decoded.payload.vct).toBe('tn.gov.moi.cin.1');
    });

    it('should have disclosures for all 19 CIN claims', async () => {
      const decoded = decodeCredential(cinCredential);
      expect(decoded.disclosureCount).toBe(19);
    });

    it('should decode CIN claims correctly', async () => {
      const decoded = decodeCredential(cinCredential);
      expect(decoded.payload.nom).toBe('Ben Salah');
      expect(decoded.payload.prenom).toBe('Ali');
      expect(decoded.payload.cin_number).toBe('09876543');
    });
  });

  describe('createPresentation + verifyPresentation round-trip', () => {
    it('should create a presentation with selected fields', async () => {
      const presentation = await createPresentation(
        credential,
        ['family_name', 'given_name', 'age_over_18'],
        'test-nonce-123',
      );

      expect(presentation).toBeDefined();
      expect(typeof presentation).toBe('string');
      // Presentation should still be an SD-JWT but with fewer disclosures
      expect(presentation).toContain('~');
    });

    it('should verify a valid presentation', async () => {
      const presentation = await createPresentation(
        credential,
        ['family_name', 'age_over_18'],
        'test-nonce-456',
      );

      const result = await verifyPresentation(presentation);
      expect(result.valid).toBe(true);
      expect(result.claims).toBeDefined();
      expect(result.claims.vct).toBe('eu.europa.ec.eudi.pid.1');
    });

    it('should only include selected disclosures in the presentation', async () => {
      const presentation = await createPresentation(
        credential,
        ['family_name'],
        'test-nonce-789',
      );

      const decoded = decodeCredential(presentation);
      // Should have family_name disclosed
      expect(decoded.payload.family_name).toBe('Ben Salah');
      // given_name should NOT be in the decoded disclosures (only 1 disclosure)
      expect(decoded.disclosureCount).toBe(1);
    });
  });
});
