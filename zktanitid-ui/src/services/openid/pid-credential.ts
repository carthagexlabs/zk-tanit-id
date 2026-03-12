/**
 * EU PID credential data utilities.
 * Maps local data formats to PID claims and provides demo data.
 */
import type { PidCredentialClaims, PidMandatoryClaims } from '../../types/eupid';

// ── Human-readable field labels for the consent screen ─────────────────────

export const PID_FIELD_LABELS: Record<string, string> = {
  family_name: 'Family Name',
  given_name: 'Given Name',
  birth_date: 'Date of Birth',
  age_over_18: 'Age Over 18',
  issuance_date: 'Issuance Date',
  expiry_date: 'Expiry Date',
  issuing_authority: 'Issuing Authority',
  issuing_country: 'Issuing Country',
  nationality: 'Nationality',
  document_number: 'Document Number',
  administrative_number: 'Administrative Number',
  gender: 'Gender',
  age_over_12: 'Age Over 12',
  age_over_14: 'Age Over 14',
  age_over_16: 'Age Over 16',
  age_over_21: 'Age Over 21',
  age_over_65: 'Age Over 65',
  age_in_years: 'Age in Years',
  age_birth_year: 'Birth Year',
  resident_address: 'Residential Address',
  resident_city: 'City of Residence',
  resident_postal_code: 'Postal Code',
  resident_state: 'State/Province',
  resident_country: 'Country of Residence',
  birth_place: 'Place of Birth',
  birth_city: 'City of Birth',
  birth_state: 'State of Birth',
  birth_country: 'Country of Birth',
  family_name_birth: 'Family Name at Birth',
  given_name_birth: 'Given Name at Birth',
};

// ── Demo PID for "Ali Ben Salah" ──────────────────────────────────────────

export function createDemoPidClaims(): PidCredentialClaims {
  return {
    family_name: 'Ben Salah',
    given_name: 'Ali',
    birth_date: '1990-03-15',
    age_over_18: true,
    issuance_date: '2025-01-15',
    expiry_date: '2030-01-15',
    issuing_authority: 'Ministry of Interior - Tunisia',
    issuing_country: 'TN',
    nationality: 'Tunisian',
    document_number: 'TN-12345678',
    gender: 'male',
    age_in_years: 35,
    age_birth_year: 1990,
    resident_city: 'Tunis',
    resident_country: 'TN',
    birth_city: 'Tunis',
    birth_country: 'TN',
  };
}

// ── NIC → PID mapping ─────────────────────────────────────────────────────

interface NicData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nicNumber: string;
  nationality?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * Map existing Tunisia NIC VC format to EU PID claims.
 * This bridges the ZK-Tanit-ID NIC verification flow to the PID namespace.
 */
export function mapTunisiaNicToPid(nicData: NicData): PidCredentialClaims {
  const birthDate = new Date(nicData.dateOfBirth);
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear();

  const todayStr = now.toISOString().split('T')[0];
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);
  const expiryStr = expiryDate.toISOString().split('T')[0];

  return {
    family_name: nicData.lastName,
    given_name: nicData.firstName,
    birth_date: nicData.dateOfBirth,
    age_over_18: age >= 18,
    issuance_date: todayStr,
    expiry_date: expiryStr,
    issuing_authority: 'Ministry of Interior - Tunisia',
    issuing_country: 'TN',
    nationality: nicData.nationality || 'Tunisian',
    document_number: nicData.nicNumber,
    gender: nicData.gender as 'male' | 'female' | 'other' | undefined,
    age_in_years: age,
    age_birth_year: birthDate.getFullYear(),
    resident_city: nicData.city,
    resident_country: nicData.country || 'TN',
    resident_address: nicData.address,
  };
}

// ── Validation ─────────────────────────────────────────────────────────────

const MANDATORY_FIELDS: (keyof PidMandatoryClaims)[] = [
  'family_name',
  'given_name',
  'birth_date',
  'age_over_18',
  'issuance_date',
  'expiry_date',
  'issuing_authority',
  'issuing_country',
];

/**
 * Validate that all mandatory PID fields are present and non-empty.
 */
export function validatePidClaims(
  claims: Partial<PidCredentialClaims>,
): { valid: boolean; missingFields: string[] } {
  const missing: string[] = [];

  for (const field of MANDATORY_FIELDS) {
    const value = claims[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  return { valid: missing.length === 0, missingFields: missing };
}
