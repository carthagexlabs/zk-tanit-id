/**
 * Tunisian CIN (Carte d'Identité Nationale) credential data utilities.
 * Provides demo data, field labels, and validation for CIN SD-JWT-VC credentials.
 */
import type { CinCredentialClaims } from '../../types/eupid';

// ── Human-readable field labels for the consent screen ─────────────────────

export const CIN_FIELD_LABELS: Record<string, string> = {
  cin_number: 'Numéro CIN',
  nom: 'Nom',
  prenom: 'Prénom',
  nom_ar: 'الاسم العائلي',
  prenom_ar: 'الاسم الشخصي',
  date_naissance: 'Date de Naissance',
  lieu_naissance: 'Lieu de Naissance',
  gouvernorat_naissance: 'Gouvernorat de Naissance',
  sexe: 'Sexe',
  nationalite: 'Nationalité',
  etat_civil: 'État Civil',
  nom_pere: 'Nom du Père',
  nom_mere: 'Nom de la Mère',
  adresse: 'Adresse',
  gouvernorat: 'Gouvernorat',
  code_postal: 'Code Postal',
  date_delivrance: 'Date de Délivrance',
  date_expiration: "Date d'Expiration",
  autorite_delivrance: 'Autorité de Délivrance',
};

// ── Demo CIN for "Ali Ben Salah" ──────────────────────────────────────────

export function createDemoCinClaims(): CinCredentialClaims {
  return {
    cin_number: '09876543',
    nom: 'Ben Salah',
    prenom: 'Ali',
    nom_ar: 'بن صالح',
    prenom_ar: 'علي',
    date_naissance: '1990-03-15',
    lieu_naissance: 'Tunis',
    gouvernorat_naissance: 'Tunis',
    sexe: 'masculin',
    nationalite: 'Tunisienne',
    etat_civil: 'célibataire',
    nom_pere: 'Mohamed Ben Salah',
    nom_mere: 'Fatma Trabelsi',
    adresse: '12 Rue de la Liberté',
    gouvernorat: 'Tunis',
    code_postal: '1000',
    date_delivrance: '2025-01-15',
    date_expiration: '2035-01-15',
    autorite_delivrance: 'Ministère de l\'Intérieur',
  };
}

// ── Validation ─────────────────────────────────────────────────────────────

const CIN_MANDATORY_FIELDS: (keyof CinCredentialClaims)[] = [
  'cin_number',
  'nom',
  'prenom',
  'nom_ar',
  'prenom_ar',
  'date_naissance',
  'lieu_naissance',
  'gouvernorat_naissance',
  'sexe',
  'nationalite',
  'etat_civil',
  'nom_pere',
  'nom_mere',
  'adresse',
  'gouvernorat',
  'code_postal',
  'date_delivrance',
  'date_expiration',
  'autorite_delivrance',
];

/**
 * Validate that all mandatory CIN fields are present and non-empty.
 */
export function validateCinClaims(
  claims: Partial<CinCredentialClaims>,
): { valid: boolean; missingFields: string[] } {
  const missing: string[] = [];

  for (const field of CIN_MANDATORY_FIELDS) {
    const value = claims[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  return { valid: missing.length === 0, missingFields: missing };
}
