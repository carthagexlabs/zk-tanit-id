import { describe, it, expect } from 'vitest';
import {
  createDemoPidClaims,
  mapTunisiaNicToPid,
  validatePidClaims,
  PID_FIELD_LABELS,
} from '../pid-credential';

describe('PID credential utilities', () => {
  describe('createDemoPidClaims', () => {
    it('should return claims with all mandatory fields', () => {
      const claims = createDemoPidClaims();
      expect(claims.family_name).toBe('Ben Salah');
      expect(claims.given_name).toBe('Ali');
      expect(claims.birth_date).toBe('1990-03-15');
      expect(claims.age_over_18).toBe(true);
      expect(claims.issuance_date).toBeDefined();
      expect(claims.expiry_date).toBeDefined();
      expect(claims.issuing_authority).toBeDefined();
      expect(claims.issuing_country).toBe('TN');
    });

    it('should include optional fields', () => {
      const claims = createDemoPidClaims();
      expect(claims.nationality).toBe('Tunisian');
      expect(claims.document_number).toBe('TN-12345678');
      expect(claims.gender).toBe('male');
    });
  });

  describe('mapTunisiaNicToPid', () => {
    it('should map NIC data to PID claims', () => {
      const nic = {
        firstName: 'Fatma',
        lastName: 'Trabelsi',
        dateOfBirth: '1985-07-22',
        nicNumber: 'NIC-99887766',
        nationality: 'Tunisian',
        gender: 'female',
        city: 'Sfax',
        country: 'TN',
      };

      const pid = mapTunisiaNicToPid(nic);
      expect(pid.given_name).toBe('Fatma');
      expect(pid.family_name).toBe('Trabelsi');
      expect(pid.birth_date).toBe('1985-07-22');
      expect(pid.age_over_18).toBe(true);
      expect(pid.issuing_country).toBe('TN');
      expect(pid.document_number).toBe('NIC-99887766');
      expect(pid.gender).toBe('female');
      expect(pid.resident_city).toBe('Sfax');
    });

    it('should calculate age_over_18 correctly for a minor', () => {
      const currentYear = new Date().getFullYear();
      const nic = {
        firstName: 'Young',
        lastName: 'Person',
        dateOfBirth: `${currentYear - 10}-01-01`,
        nicNumber: 'NIC-00001111',
      };

      const pid = mapTunisiaNicToPid(nic);
      expect(pid.age_over_18).toBe(false);
      expect(pid.age_in_years).toBe(10);
    });

    it('should set default values for optional NIC fields', () => {
      const nic = {
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '2000-06-15',
        nicNumber: 'NIC-XXXX',
      };

      const pid = mapTunisiaNicToPid(nic);
      expect(pid.nationality).toBe('Tunisian'); // default
      expect(pid.resident_country).toBe('TN'); // default
      expect(pid.issuing_authority).toBe('Ministry of Interior - Tunisia');
    });
  });

  describe('validatePidClaims', () => {
    it('should pass validation for complete claims', () => {
      const claims = createDemoPidClaims();
      const result = validatePidClaims(claims);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should fail validation for missing mandatory fields', () => {
      const result = validatePidClaims({
        family_name: 'Test',
        given_name: 'User',
        // missing birth_date, age_over_18, etc.
      });
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('birth_date');
      expect(result.missingFields).toContain('age_over_18');
      expect(result.missingFields).toContain('issuance_date');
    });

    it('should treat empty strings as missing', () => {
      const claims = createDemoPidClaims();
      const result = validatePidClaims({ ...claims, family_name: '' });
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('family_name');
    });
  });

  describe('PID_FIELD_LABELS', () => {
    it('should have labels for all mandatory fields', () => {
      const mandatory = [
        'family_name', 'given_name', 'birth_date', 'age_over_18',
        'issuance_date', 'expiry_date', 'issuing_authority', 'issuing_country',
      ];
      for (const field of mandatory) {
        expect(PID_FIELD_LABELS[field]).toBeDefined();
        expect(typeof PID_FIELD_LABELS[field]).toBe('string');
      }
    });
  });
});
