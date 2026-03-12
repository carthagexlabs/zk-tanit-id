import { createContext, useState, useCallback, type ReactNode } from 'react';
import type {
  StoredCredential,
  OID4VPAuthorizationRequest,
  OID4VPAuthorizationResponse,
  PresentationConsent,
  CredentialClaims,
  CinCredentialClaims,
} from '../types/eupid';
import { PID_VCT, CIN_VCT } from '../types/eupid';
import {
  issueDemoPidCredential,
  issueDemoCinCredential,
  createPresentation,
  decodeCredential,
  createDemoPidClaims,
  createDemoCinClaims,
  PID_FIELD_LABELS,
  CIN_FIELD_LABELS,
  parseAuthorizationRequest,
  matchCredentials,
  extractRequestedFields,
  buildAuthorizationResponse,
} from '../services/openid';

export interface OpenIDContextType {
  // State
  credentials: StoredCredential[];
  currentRequest: OID4VPAuthorizationRequest | null;
  consent: PresentationConsent | null;
  isProcessing: boolean;
  error: string | null;
  lastResponse: OID4VPAuthorizationResponse | null;
  matchedCredential: StoredCredential | null;

  // Actions
  addCredential: (raw: string, claims: CredentialClaims) => void;
  loadDemoPidCredential: () => Promise<void>;
  loadDemoCinCredential: () => Promise<void>;
  handleAuthorizationRequest: (uri: string) => void;
  updateSelectedFields: (path: string, selected: boolean) => void;
  submitPresentation: () => Promise<void>;
  cancelPresentation: () => void;
  clearError: () => void;
}

export const OpenIDContext = createContext<OpenIDContextType | undefined>(undefined);

interface OpenIDProviderProps {
  children: ReactNode;
}

export function OpenIDProvider({ children }: OpenIDProviderProps) {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [currentRequest, setCurrentRequest] = useState<OID4VPAuthorizationRequest | null>(null);
  const [consent, setConsent] = useState<PresentationConsent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<OID4VPAuthorizationResponse | null>(null);
  const [matchedCredential, setMatchedCredential] = useState<StoredCredential | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const addCredential = useCallback((raw: string, claims: CredentialClaims) => {
    const decoded = decodeCredential(raw);
    const vct = (decoded.payload.vct as string) || PID_VCT;

    // Derive issuedAt/expiresAt from the appropriate claim fields
    let issuedAt: string;
    let expiresAt: string;
    if ('issuance_date' in claims) {
      issuedAt = claims.issuance_date;
      expiresAt = claims.expiry_date;
    } else {
      issuedAt = (claims as CinCredentialClaims).date_delivrance;
      expiresAt = (claims as CinCredentialClaims).date_expiration;
    }

    const stored: StoredCredential = {
      id: crypto.randomUUID(),
      raw,
      vct,
      claims,
      issuedAt,
      expiresAt,
      issuer: (decoded.payload.iss as string) || 'unknown',
    };
    setCredentials((prev) => [...prev, stored]);
  }, []);

  const loadDemoPidCredential = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const claims = createDemoPidClaims();
      const raw = await issueDemoPidCredential(claims);
      addCredential(raw, claims);
    } catch (err) {
      setError(`Failed to issue demo credential: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  }, [addCredential]);

  const loadDemoCinCredential = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const claims = createDemoCinClaims();
      const raw = await issueDemoCinCredential(claims);
      addCredential(raw, claims);
    } catch (err) {
      setError(`Failed to issue demo CIN credential: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  }, [addCredential]);

  const handleAuthorizationRequest = useCallback(
    (uri: string) => {
      setError(null);
      setLastResponse(null);
      try {
        const request = parseAuthorizationRequest(uri);
        setCurrentRequest(request);

        // Match credentials
        const matched = matchCredentials(request, credentials);
        if (matched.length === 0) {
          setError('No matching credentials found. Load a PID credential first.');
          setCurrentRequest(null);
          return;
        }

        setMatchedCredential(matched[0]);

        // Build consent from requested fields
        const requestedFields = extractRequestedFields(request);
        // Resolve field labels based on matched credential type
        const fieldLabels = matched[0].vct === CIN_VCT
          ? { ...PID_FIELD_LABELS, ...CIN_FIELD_LABELS }
          : PID_FIELD_LABELS;

        const consentData: PresentationConsent = {
          verifierName: request.client_id,
          verifierPurpose: request.presentation_definition.purpose,
          requestedFields: requestedFields.map((f) => ({
            path: f.path,
            label: fieldLabels[f.path] || f.path,
            required: f.required,
            selected: true, // default all selected
          })),
        };
        setConsent(consentData);
      } catch (err) {
        setError(`Invalid request: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [credentials],
  );

  const updateSelectedFields = useCallback((path: string, selected: boolean) => {
    setConsent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        requestedFields: prev.requestedFields.map((f) =>
          f.path === path ? { ...f, selected } : f,
        ),
      };
    });
  }, []);

  const submitPresentation = useCallback(async () => {
    if (!currentRequest || !consent || !matchedCredential) {
      setError('No active presentation request');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const selectedFields = consent.requestedFields
        .filter((f) => f.selected)
        .map((f) => f.path);

      const vpToken = await createPresentation(
        matchedCredential.raw,
        selectedFields,
        currentRequest.nonce,
        currentRequest.client_id,
      );

      const response = buildAuthorizationResponse(currentRequest, vpToken);
      setLastResponse(response);
      setCurrentRequest(null);
      setConsent(null);
      setMatchedCredential(null);
    } catch (err) {
      setError(`Presentation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  }, [currentRequest, consent, matchedCredential]);

  const cancelPresentation = useCallback(() => {
    setCurrentRequest(null);
    setConsent(null);
    setMatchedCredential(null);
    setLastResponse(null);
  }, []);

  const value: OpenIDContextType = {
    credentials,
    currentRequest,
    consent,
    isProcessing,
    error,
    lastResponse,
    matchedCredential,
    addCredential,
    loadDemoPidCredential,
    loadDemoCinCredential,
    handleAuthorizationRequest,
    updateSelectedFields,
    submitPresentation,
    cancelPresentation,
    clearError,
  };

  return (
    <OpenIDContext.Provider value={value}>
      {children}
    </OpenIDContext.Provider>
  );
}
