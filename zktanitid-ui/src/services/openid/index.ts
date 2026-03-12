export {
  issueDemoPidCredential,
  issueDemoCinCredential,
  createPresentation,
  verifyPresentation,
  decodeCredential,
  getDemoKeyPair,
} from './sd-jwt';

export {
  createDemoPidClaims,
  mapTunisiaNicToPid,
  validatePidClaims,
  PID_FIELD_LABELS,
} from './pid-credential';

export {
  createDemoCinClaims,
  validateCinClaims,
  CIN_FIELD_LABELS,
} from './cin-credential';

export {
  parseAuthorizationRequest,
  buildAuthorizationResponse,
  matchCredentials,
  extractRequestedFields,
  createDemoAuthorizationRequestUri,
  createDemoCinAuthorizationRequestUri,
} from './oid4vp';
