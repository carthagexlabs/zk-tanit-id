import { describe, it, expect } from 'vitest';
import {
  createDemoCinClaims,
  validateCinClaims,
  CIN_FIELD_LABELS,
} from '../cin-credential';

describe('CIN credential utilities', () => {
  describe('createDemoCinClaims', () => {
    it('should return claims with all mandatory fields', () => {
      const claims = createDemoCinClaims();
      expect(claims.cin_number).toBe('09876543');
      expect(claims.nom).toBe('Ben Salah');
      expect(claims.prenom).toBe('Ali');
      expect(claims.nom_ar).toBe('بن صالح');
      expect(claims.prenom_ar).toBe('علي');
      expect(claims.date_naissance).toBe('1990-03-15');
      expect(claims.lieu_naissance).toBe('Tunis');
      expect(claims.gouvernorat_naissance).toBe('Tunis');
      expect(claims.sexe).toBe('masculin');
      expect(claims.nationalite).toBe('Tunisienne');
      expect(claims.etat_civil).toBe('célibataire');
      expect(claims.nom_pere).toBeDefined();
      expect(claims.nom_mere).toBeDefined();
      expect(claims.adresse).toBeDefined();
      expect(claims.gouvernorat).toBe('Tunis');
      expect(claims.code_postal).toBe('1000');
      expect(claims.date_delivrance).toBeDefined();
      expect(claims.date_expiration).toBeDefined();
      expect(claims.autorite_delivrance).toBeDefined();
    });

    it('should use the same demo persona as PID (Ali Ben Salah)', () => {
      const claims = createDemoCinClaims();
      expect(claims.prenom).toBe('Ali');
      expect(claims.nom).toBe('Ben Salah');
      expect(claims.date_naissance).toBe('1990-03-15');
    });
  });

  describe('validateCinClaims', () => {
    it('should pass validation for complete claims', () => {
      const claims = createDemoCinClaims();
      const result = validateCinClaims(claims);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should fail validation for missing mandatory fields', () => {
      const result = validateCinClaims({
        cin_number: '12345678',
        nom: 'Test',
        // missing many required fields
      });
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('prenom');
      expect(result.missingFields).toContain('nom_ar');
      expect(result.missingFields).toContain('date_naissance');
    });

    it('should treat empty strings as missing', () => {
      const claims = createDemoCinClaims();
      const result = validateCinClaims({ ...claims, cin_number: '' });
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('cin_number');
    });
  });

  describe('CIN_FIELD_LABELS', () => {
    it('should have labels for all CIN fields', () => {
      const cinFields = [
        'cin_number', 'nom', 'prenom', 'nom_ar', 'prenom_ar',
        'date_naissance', 'lieu_naissance', 'gouvernorat_naissance',
        'sexe', 'nationalite', 'etat_civil',
        'nom_pere', 'nom_mere',
        'adresse', 'gouvernorat', 'code_postal',
        'date_delivrance', 'date_expiration', 'autorite_delivrance',
      ];
      for (const field of cinFields) {
        expect(CIN_FIELD_LABELS[field]).toBeDefined();
        expect(typeof CIN_FIELD_LABELS[field]).toBe('string');
      }
    });
  });
});
