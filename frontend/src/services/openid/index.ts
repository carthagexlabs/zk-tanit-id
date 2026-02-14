export {
  issueDemoPidCredential,
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
  parseAuthorizationRequest,
  buildAuthorizationResponse,
  matchCredentials,
  extractRequestedFields,
  createDemoAuthorizationRequestUri,
} from './oid4vp';
