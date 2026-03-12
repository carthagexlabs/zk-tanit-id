export interface Disclosure {
  salt: string;
  claim_name: string;
  claim_value: string | number | boolean;
  encoded: string;
}

export interface KeyBindingJwt {
  header: {
    alg: string;
    typ: string;
  };
  payload: {
    iat: number;
    nonce: string;
    aud: string;
    sd_hash: string;
  };
}

export interface SdJwtCredential {
  format: string;
  compact: string;
  header: {
    alg: string;
    typ: string;
    kid: string;
  };
  payload: {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
    nbf: number;
    jti: string;
    vct: string;
    status: {
      idx: number;
      uri: string;
    };
    _sd_alg: string;
    _sd: string[];
    verified_claims: {
      verification: {
        trust_framework: string;
        assurance_level: string;
        evidence: Array<{
          type: string;
          method: string;
          document: {
            type: string;
            issuer: { name: string; country: string };
            number: string;
            date_of_issuance: string;
            date_of_expiry: string;
          };
        }>;
      };
      claims: Record<string, boolean | Record<string, boolean>>;
    };
    cnf: { jwk: Record<string, string> };
  };
  disclosures: Disclosure[];
  kb_jwt: KeyBindingJwt;
}

export interface SelectedClaim {
  claim_name: string;
  claim_value: string | number | boolean;
  disclosed: boolean;
}
