# OpenID4VP + SD-JWT-VC Integration for ZK-Tanit-ID

> Branch: `feature/openid-eupid-compliance`
> This document covers the full OpenID4VP / SD-JWT-VC feature set added across two development phases on this branch.

---

## Table of Contents

1. [Overview](#overview)
2. [What Was Built (Changelog)](#what-was-built-changelog)
3. [Background & Concepts](#background--concepts)
4. [Standards & Protocols](#standards--protocols)
5. [Tech Stack & Dependencies](#tech-stack--dependencies)
6. [Architecture & File Map](#architecture--file-map)
7. [EU PID Credential (Phase 1)](#eu-pid-credential-phase-1)
8. [Tunisian CIN Credential (Phase 2)](#tunisian-cin-credential-phase-2)
9. [The OID4VP Presentation Flow](#the-oid4vp-presentation-flow)
10. [Wallet-Gated UI](#wallet-gated-ui)
11. [App Navigation Model](#app-navigation-model)
12. [Developer Guide](#developer-guide)
13. [Testing](#testing)
14. [Adding New Credential Types](#adding-new-credential-types)
15. [Demo Reference Files](#demo-reference-files)
16. [Glossary](#glossary)

---

## Overview

ZK-Tanit-ID now has **two parallel verification paths** accessible from the Hero landing page:

1. **ZK Verification Flow** (original) -- 5-step privacy-preserving verification using zero-knowledge proofs on the Midnight blockchain.
2. **OpenID4VP Presentation Flow** (new) -- Holder-side credential presentation using SD-JWT-VC and the OID4VP protocol, compliant with eIDAS 2.0 / ARF v2.8.0.

Within the OpenID4VP path, the app supports **two credential types**:

| Credential | VCT Identifier | Claim Language | Fields |
|---|---|---|---|
| **EU PID** (Person Identification Data) | `eu.europa.ec.eudi.pid.1` | English | 8 mandatory + ~20 optional |
| **Tunisian CIN** (Carte d'Identite Nationale) | `tn.gov.moi.cin.1` | French / Arabic | 19 mandatory |

Both credentials are issued as **SD-JWT-VC** tokens, stored in-browser, and can be selectively disclosed to verifiers via the OID4VP consent flow.

---

## What Was Built (Changelog)

### Phase 1 -- OpenID4VP + EU PID SD-JWT-VC Integration

**Commit:** `e2b4891` -- *Add OpenID4VP + SD-JWT-VC integration for EU PID compliance (ARF v2.8.0)*

This commit introduced the complete holder-side OID4VP presentation flow:

- **Type system** (`src/types/eupid.ts`) -- EU PID claim interfaces (mandatory + optional), OID4VP protocol types (authorization request/response, presentation definition, input descriptors, consent model)
- **SD-JWT-VC engine** (`src/services/openid/sd-jwt.ts`) -- Issue, present (selective disclosure), verify, and decode SD-JWT-VC credentials using `@sd-jwt/sd-jwt-vc` + Web Crypto API (ES256 / P-256)
- **OID4VP protocol** (`src/services/openid/oid4vp.ts`) -- Parse `openid4vp://` URIs, match credentials against input descriptors by VCT, extract requested fields, build authorization responses with VP tokens
- **PID credential utilities** (`src/services/openid/pid-credential.ts`) -- Demo "Ali Ben Salah" PID data, field labels for consent screen, NIC-to-PID mapping function, mandatory field validation
- **React context** (`src/contexts/OpenIDContext.tsx`) + `useOpenID` hook -- State management for credentials, authorization requests, consent, and presentation lifecycle (mirrors `WalletContext` pattern)
- **UI components**:
  - `CredentialCard` -- displays a stored credential with holder name, issuer, expiry, field count
  - `PidCredentialStore` -- credential list + "Load Demo PID" button
  - `ConsentScreen` -- interactive consent UI with per-field toggles, required field indicators, and approve/deny actions
  - `PresentationRequestFlow` -- 3-step flow (Request -> Consent -> Response) with step indicator, demo request, URI input, VP token display
- **App navigation** (`App.tsx`) -- New `AppView` type (`hero | zk-verification | openid-present`) with "Present EU PID Credential" CTA on Hero
- **Provider wiring** (`main.tsx`) -- `OpenIDProvider` wraps the app alongside `WalletProvider`
- **Demo reference files** -- `pid_sd_jwt_vc.json`, `demo_oid4vp_request.json`
- **31 unit tests** across `sd-jwt.test.ts`, `oid4vp.test.ts`, `pid-credential.test.ts`
- **New npm dependencies**: `@sd-jwt/sd-jwt-vc`, `@sd-jwt/types`, `@sd-jwt/utils` (all `^0.19.0`)

**Files added/modified:** 21 files, +2,256 lines

### Phase 2 -- Tunisian CIN Credential + Wallet-Gated UI

**Uncommitted changes** on the same branch.

This phase adds a second credential type and tightens the Hero UI:

- **CIN type definitions** (`src/types/eupid.ts`) -- `CIN_VCT` constant, `CinCredentialClaims` interface (19 bilingual fields), `CredentialClaims` union type, `StoredCredential.claims` accepts either PID or CIN
- **CIN credential service** (`src/services/openid/cin-credential.ts`) -- `CIN_FIELD_LABELS` (French/Arabic), `createDemoCinClaims()` for "Ali Ben Salah", `validateCinClaims()` with mandatory field checks
- **CIN SD-JWT-VC issuance** (`src/services/openid/sd-jwt.ts`) -- `issueDemoCinCredential()` with `tn.gov.moi.cin.1` VCT and 10-year validity
- **CIN OID4VP demo request** (`src/services/openid/oid4vp.ts`) -- `createDemoCinAuthorizationRequestUri()` simulating a Tunisian administrative office
- **OpenID context updates** (`src/contexts/OpenIDContext.tsx`) -- `addCredential()` handles both PID/CIN date fields, `loadDemoCinCredential()` action, consent label resolution using CIN labels
- **UI updates**:
  - `PidCredentialStore.tsx` -- "Load Demo CIN" emerald button alongside "Load Demo PID"
  - `CredentialCard.tsx` -- "Tunisian CIN" vs "EU Person ID" display, CIN name resolution (`prenom nom`), emerald accent color
  - `Hero.tsx` -- "Present EU PID Credential" button gated behind `isConnected` check
- **CIN demo reference** -- `cin_sd_jwt_vc.json`
- **20 new tests** (6 CIN credential + 4 CIN SD-JWT + 2 CIN OID4VP + 8 updates)

**Files added/modified:** 13 files

---

## Background & Concepts

### What is SD-JWT-VC?

**SD-JWT-VC** (Selective Disclosure JWT - Verifiable Credential) is a credential format where:

- An **issuer** signs a JWT containing the holder's claims (e.g., name, date of birth)
- Each claim is individually **hashed** in the JWT payload (using SHA-256 + random salt)
- The actual claim values are attached as **disclosures** -- base64url-encoded `[salt, name, value]` arrays appended after the JWT signature with `~` separators
- The **holder** can choose which disclosures to include when presenting to a verifier
- The **verifier** can only see claims whose disclosures are present; all others appear as opaque hashes

**Compact format:**
```
<header>.<payload>.<signature>~<disclosure1>~<disclosure2>~...~<disclosureN>~
```

**Example disclosure (decoded):**
```json
["r4Nf3k2L9mQ", "family_name", "Ben Salah"]
```

### What is OID4VP?

**OpenID for Verifiable Presentations (OID4VP)** is a protocol that allows a **verifier** to request specific credentials from a **holder** (wallet). The flow:

1. Verifier constructs an `openid4vp://` authorization request URI containing a **presentation definition** -- a JSON structure describing which credential types and fields are needed
2. Holder's app parses the request, finds matching credentials, and shows a **consent screen**
3. Holder approves, and the app creates a **VP Token** (the SD-JWT with only selected disclosures + a Key Binding JWT)
4. The VP Token + **presentation submission** metadata is sent back to the verifier

### What is a CIN?

The **Carte d'Identite Nationale (CIN)** is Tunisia's national identity card, issued by the Ministry of Interior. Every Tunisian citizen aged 18+ is required to carry one. It contains bilingual (French + Arabic) identity information.

### What is EU PID?

**Person Identification Data (PID)** is the EU's standardized digital identity credential defined under eIDAS 2.0 and the Architecture Reference Framework (ARF) v2.8.0. It uses the namespace `eu.europa.ec.eudi.pid.1` and includes standardized attributes like `family_name`, `given_name`, `birth_date`, `age_over_18`, etc.

---

## Standards & Protocols

| Standard | Spec Reference | Role in This Project |
|---|---|---|
| **SD-JWT-VC** | [draft-ietf-oauth-sd-jwt-vc-05](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/) | Credential format -- each claim is individually disclosable via salted hashes |
| **SD-JWT** | [draft-ietf-oauth-selective-disclosure-jwt-13](https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/) | Underlying signed token mechanism with selective disclosure |
| **OID4VP** | [OpenID4VP draft 23](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) | Verifier-to-holder request protocol via `openid4vp://` URIs |
| **ES256 / P-256** | [RFC 7518](https://www.rfc-editor.org/rfc/rfc7518) | ECDSA signing algorithm (JWT signatures) |
| **Web Crypto API** | [W3C Spec](https://www.w3.org/TR/WebCryptoAPI/) | Browser-native key generation, signing, hashing, and verification |
| **eIDAS 2.0 / ARF v2.8.0** | EU Architecture Reference Framework | Defines EU PID claim namespace; CIN extends the pattern for Tunisia |

### Protocol Flow Diagram

```
    ISSUER                              HOLDER (this app)                     VERIFIER
      |                                       |                                  |
      |  1. Issue SD-JWT-VC                   |                                  |
      |  (sign with ES256, all claims hashed) |                                  |
      | ------------------------------------> |                                  |
      |                                       |                                  |
      |                                       |  2. openid4vp:// request         |
      |                                       | <------------------------------- |
      |                                       |    "Show me family_name,         |
      |                                       |     age_over_18"                 |
      |                                       |                                  |
      |                                       |  3. User reviews consent screen  |
      |                                       |     [x] Family Name              |
      |                                       |     [x] Age Over 18              |
      |                                       |     [ ] Date of Birth (optional) |
      |                                       |                                  |
      |                                       |  4. Create VP Token              |
      |                                       |     (include only 2 disclosures  |
      |                                       |      + Key Binding JWT)          |
      |                                       | -------------------------------> |
      |                                       |     VP Token + submission        |
      |                                       |                                  |
      |                                       |                    5. Verify     |
      |                                       |                    signature +   |
      |                                       |                    disclosures   |
```

---

## Tech Stack & Dependencies

### Application Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.x | UI framework |
| **TypeScript** | 5.9.x | Type-safe development |
| **Vite** | 7.3.x | Build tool and dev server |
| **Tailwind CSS** | 4.1.x | Utility-first styling |
| **Lucide React** | 0.563.x | Icon library |

### OpenID / Credential Libraries

| Package | Version | Purpose |
|---|---|---|
| `@sd-jwt/sd-jwt-vc` | ^0.19.0 | SD-JWT-VC issuance, presentation, and verification |
| `@sd-jwt/types` | ^0.19.0 | TypeScript types for disclosure frames, presentation frames |
| `@sd-jwt/utils` | ^0.19.0 | Base64url encoding utilities |

### Midnight Blockchain (Wallet Integration)

| Package | Version | Purpose |
|---|---|---|
| `@midnight-ntwrk/dapp-connector-api` | ^4.0.0 | Lace Midnight Preview wallet v4 DApp Connector |
| Various `@midnight-ntwrk/*` | 3.0.0 / 4.0.0 | Ledger, contracts, indexer, SDK providers |

### Testing

| Package | Version | Purpose |
|---|---|---|
| **Vitest** | 4.0.x | Test runner |
| **jsdom** | 28.x | Browser environment simulation |
| `@testing-library/react` | 16.3.x | React component testing |
| `@testing-library/user-event` | 14.6.x | User interaction simulation |

---

## Architecture & File Map

### Complete OpenID Module Structure

```
frontend/src/
|
+-- types/
|   +-- eupid.ts                          # All type definitions
|       - PID_VCT, CIN_VCT constants
|       - PidMandatoryClaims, PidOptionalClaims, PidCredentialClaims
|       - CinCredentialClaims
|       - CredentialClaims (union)
|       - StoredCredential
|       - OID4VP types (request, response, consent, etc.)
|
+-- services/openid/
|   +-- index.ts                          # Barrel exports
|   +-- sd-jwt.ts                         # SD-JWT-VC core engine
|   |   - getDemoKeyPair()                  (ECDSA P-256 keypair)
|   |   - issueDemoPidCredential()          (PID issuance)
|   |   - issueDemoCinCredential()          (CIN issuance)
|   |   - createPresentation()              (selective disclosure)
|   |   - verifyPresentation()              (signature + disclosure check)
|   |   - decodeCredential()                (JWT decode + disclosure parse)
|   |
|   +-- pid-credential.ts                # EU PID data utilities
|   |   - PID_FIELD_LABELS                  (English labels)
|   |   - createDemoPidClaims()             (Ali Ben Salah PID)
|   |   - mapTunisiaNicToPid()              (NIC -> PID bridge)
|   |   - validatePidClaims()               (mandatory field check)
|   |
|   +-- cin-credential.ts                # Tunisian CIN data utilities
|   |   - CIN_FIELD_LABELS                  (French/Arabic labels)
|   |   - createDemoCinClaims()             (Ali Ben Salah CIN)
|   |   - validateCinClaims()               (mandatory field check)
|   |
|   +-- oid4vp.ts                         # OID4VP protocol
|   |   - parseAuthorizationRequest()       (openid4vp:// URI parser)
|   |   - matchCredentials()                (VCT-based credential matching)
|   |   - extractRequestedFields()          (field extraction from descriptors)
|   |   - buildAuthorizationResponse()      (VP token + submission)
|   |   - createDemoAuthorizationRequestUri()   (bank KYC demo)
|   |   - createDemoCinAuthorizationRequestUri() (admin office demo)
|   |
|   +-- __tests__/
|       +-- sd-jwt.test.ts                (12 tests)
|       +-- oid4vp.test.ts                (16 tests)
|       +-- pid-credential.test.ts        (9 tests)
|       +-- cin-credential.test.ts        (6 tests)
|
+-- contexts/
|   +-- OpenIDContext.tsx                  # React context provider
|       - credentials[], currentRequest, consent, lastResponse
|       - addCredential(), loadDemoPidCredential(), loadDemoCinCredential()
|       - handleAuthorizationRequest(), submitPresentation(), cancelPresentation()
|
+-- hooks/
|   +-- useOpenID.ts                      # Context consumer hook
|
+-- components/
    +-- Hero.tsx                           # Landing page (wallet-gated buttons)
    +-- App.tsx                            # AppView navigation (hero|zk|openid)
    +-- openid/
        +-- PidCredentialStore.tsx         # Credential list + Load Demo PID/CIN buttons
        +-- CredentialCard.tsx             # Credential display card (PID or CIN)
        +-- ConsentScreen.tsx             # Field-by-field consent UI
        +-- PresentationRequestFlow.tsx   # 3-step flow orchestrator
```

### Provider Hierarchy

```
main.tsx
  <StrictMode>
    <WalletProvider>        // Lace Midnight Preview wallet state
      <OpenIDProvider>      // OpenID credential + presentation state
        <App />
      </OpenIDProvider>
    </WalletProvider>
  </StrictMode>
```

---

## EU PID Credential (Phase 1)

### VCT: `eu.europa.ec.eudi.pid.1`

The EU PID credential follows the ARF v2.8.0 claim namespace.

**Mandatory Claims (8):**

| Field | Type | Description |
|---|---|---|
| `family_name` | `string` | Family name |
| `given_name` | `string` | Given name |
| `birth_date` | `string` | Date of birth (ISO 8601) |
| `age_over_18` | `boolean` | Whether holder is 18+ |
| `issuance_date` | `string` | Credential issuance date |
| `expiry_date` | `string` | Credential expiry date |
| `issuing_authority` | `string` | Authority that issued the credential |
| `issuing_country` | `string` | ISO 3166-1 alpha-2 country code |

**Optional Claims (~20):** `nationality`, `document_number`, `gender`, `age_over_12/14/16/21/65`, `age_in_years`, `age_birth_year`, `resident_address/city/postal_code/state/country`, `birth_place/city/state/country`, `portrait`, etc.

**Demo persona:** Ali Ben Salah, born 1990-03-15, Tunisian, issued by Ministry of Interior - Tunisia.

### Demo PID Authorization Request

Simulates a **bank KYC** verifier requesting:
- `family_name`, `given_name`, `age_over_18`
- Client: `https://demo-bank.example.com`

---

## Tunisian CIN Credential (Phase 2)

### VCT: `tn.gov.moi.cin.1`

The CIN credential models Tunisia's physical national identity card as a digital verifiable credential.

**All 19 Claims (all mandatory, all selectively disclosable):**

| Field | Type | Description | Example |
|---|---|---|---|
| `cin_number` | `string` | 8-digit CIN number | `"09876543"` |
| `nom` | `string` | Family name (Latin) | `"Ben Salah"` |
| `prenom` | `string` | Given name (Latin) | `"Ali"` |
| `nom_ar` | `string` | Family name (Arabic) | `"بن صالح"` |
| `prenom_ar` | `string` | Given name (Arabic) | `"علي"` |
| `date_naissance` | `string` | Date of birth (ISO 8601) | `"1990-03-15"` |
| `lieu_naissance` | `string` | Place of birth | `"Tunis"` |
| `gouvernorat_naissance` | `string` | Governorate of birth | `"Tunis"` |
| `sexe` | `"masculin" \| "feminin"` | Gender | `"masculin"` |
| `nationalite` | `string` | Nationality | `"Tunisienne"` |
| `etat_civil` | `enum` | Marital status | `"celibataire"` |
| `nom_pere` | `string` | Father's full name | `"Mohamed Ben Salah"` |
| `nom_mere` | `string` | Mother's full name | `"Fatma Trabelsi"` |
| `adresse` | `string` | Current address | `"12 Rue de la Liberte"` |
| `gouvernorat` | `string` | Governorate of residence | `"Tunis"` |
| `code_postal` | `string` | Postal code | `"1000"` |
| `date_delivrance` | `string` | Issuance date (ISO 8601) | `"2025-01-15"` |
| `date_expiration` | `string` | Expiry date (ISO 8601) | `"2035-01-15"` |
| `autorite_delivrance` | `string` | Issuing authority | `"Ministere de l'Interieur"` |

**Demo persona:** Same Ali Ben Salah as PID (consistent cross-credential identity).

### Demo CIN Authorization Request

Simulates a **Tunisian administrative office** requesting:
- `cin_number`, `nom`, `prenom`, `date_naissance`
- Client: `https://demo-admin.gov.tn`

### CIN vs EU PID Comparison

| Aspect | EU PID | Tunisian CIN |
|---|---|---|
| VCT | `eu.europa.ec.eudi.pid.1` | `tn.gov.moi.cin.1` |
| Spec basis | ARF v2.8.0 / eIDAS 2.0 | Tunisian national ID card |
| Name fields | `family_name`, `given_name` | `nom`, `prenom`, `nom_ar`, `prenom_ar` (bilingual) |
| Mandatory fields | 8 | 19 (all fields) |
| Optional fields | ~20 | 0 |
| Demo validity | 1 year | 10 years |
| Unique attributes | `age_over_18`, age bracket booleans | Arabic names, parent names, marital status |
| Consent labels | English | French + Arabic |
| Card accent color | Purple | Emerald |

---

## The OID4VP Presentation Flow

The `PresentationRequestFlow` component implements a 3-step flow:

### Step 1: Request

- User sees their **credential store** with loaded PID/CIN credentials
- They can paste an `openid4vp://` URI from a verifier, or click **"Try Demo Request"**
- The app parses the URI, matches stored credentials by VCT, and transitions to Step 2

### Step 2: Consent

- The **ConsentScreen** shows:
  - Verifier identity (client_id) and purpose
  - Which credential is being used (with holder name)
  - List of requested fields with checkboxes
  - Required fields are locked (can't uncheck), optional fields are toggleable
  - Each field shows its current value and a human-readable label
  - Privacy warning: "Only selected attributes will be shared"
- User clicks **"Approve & Share"** or **"Deny"**

### Step 3: Response

- The app creates a VP Token (SD-JWT with selected disclosures + KB-JWT)
- Displays the VP Token and Presentation Submission JSON
- User can **copy** the full response or start a **new presentation**

### Under the Hood

```typescript
// 1. Parse the openid4vp:// URI
const request = parseAuthorizationRequest(uri);

// 2. Match stored credentials by VCT
const matched = matchCredentials(request, credentials);

// 3. Extract requested fields for the consent screen
const fields = extractRequestedFields(request);

// 4. Create VP Token with selective disclosure
const vpToken = await createPresentation(
  credential.raw,
  selectedFields,    // only fields the user approved
  request.nonce,     // verifier's nonce (replay protection)
  request.client_id  // audience (key binding)
);

// 5. Build authorization response
const response = buildAuthorizationResponse(request, vpToken);
// { vp_token: "...", presentation_submission: {...}, state: "..." }
```

---

## Wallet-Gated UI

The Hero section gates certain actions behind wallet connection:

### Wallet Disconnected

```
[ Connect Wallet First ]        (amber button, calls wallet.connect())
  "Please connect your Lace Midnight Preview wallet to start verification"
```

- "Start Identity Verification" is hidden
- "Present EU PID Credential" is hidden

### Wallet Connected

```
[ Start Identity Verification ] (purple button -> ZK flow)
[ Present EU PID Credential ]   (blue-cyan button -> OpenID4VP flow)
```

**Implementation** (`Hero.tsx:119`):
```tsx
{onStartOpenID && isConnected && (
  <button onClick={onStartOpenID}>Present EU PID Credential</button>
)}
```

---

## App Navigation Model

The app uses a simple state-based view model:

```typescript
type AppView = 'hero' | 'zk-verification' | 'openid-present';
```

| View | Component | Entry Point |
|---|---|---|
| `hero` | `<Hero />` | Default / back buttons |
| `zk-verification` | `<VerificationFlow />` | "Start Identity Verification" button |
| `openid-present` | `<PresentationRequestFlow />` | "Present EU PID Credential" button |

Navigation functions in `App.tsx`:
- `handleStartZk()` -- sets view to `zk-verification`
- `handleStartOpenID()` -- sets view to `openid-present`
- `handleBackToHero()` -- resets to `hero`

---

## Developer Guide

### Setup & Run

```bash
cd frontend
npm install
npm run dev       # Start dev server (hot reload)
npm run build     # Production build (TypeScript check)
npm run lint      # ESLint
npm test          # Run all tests
npm run test:watch # Watch mode
```

### Code Examples

#### Issue a PID Credential

```typescript
import { createDemoPidClaims } from './services/openid/pid-credential';
import { issueDemoPidCredential } from './services/openid/sd-jwt';

const claims = createDemoPidClaims();
const sdJwt = await issueDemoPidCredential(claims);
// "eyJhbGciOiJFUzI1NiJ9.eyJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSI...~disc1~disc2~..."
```

#### Issue a CIN Credential

```typescript
import { createDemoCinClaims } from './services/openid/cin-credential';
import { issueDemoCinCredential } from './services/openid/sd-jwt';

const claims = createDemoCinClaims();
const sdJwt = await issueDemoCinCredential(claims);
// "eyJhbGciOiJFUzI1NiJ9.eyJ2Y3QiOiJ0bi5nb3YubW9pLmNpbi4xIi...~disc1~...~disc19~"
```

#### Create a Selective Disclosure Presentation

```typescript
import { createPresentation } from './services/openid/sd-jwt';

const vpToken = await createPresentation(
  storedCredential.raw,      // full SD-JWT-VC
  ['family_name', 'age_over_18'],  // fields to disclose
  'verifier-nonce-123',      // nonce from the request
  'https://verifier.com',    // audience
);
```

#### Parse and Process an OID4VP Request

```typescript
import {
  parseAuthorizationRequest,
  matchCredentials,
  extractRequestedFields,
  buildAuthorizationResponse,
} from './services/openid/oid4vp';

const request = parseAuthorizationRequest('openid4vp://?...');
const matched = matchCredentials(request, myCredentials);
const fields = extractRequestedFields(request);
// ... user consent ...
const response = buildAuthorizationResponse(request, vpToken);
```

#### Validate Claims Before Issuance

```typescript
import { validatePidClaims } from './services/openid/pid-credential';
import { validateCinClaims } from './services/openid/cin-credential';

const pidResult = validatePidClaims(partialPidClaims);
// { valid: false, missingFields: ['birth_date', 'age_over_18'] }

const cinResult = validateCinClaims(partialCinClaims);
// { valid: false, missingFields: ['nom_ar', 'prenom_ar', ...] }
```

#### Use in React Components

```typescript
import { useOpenID } from '../hooks/useOpenID';

function MyComponent() {
  const {
    credentials,
    isProcessing,
    loadDemoPidCredential,
    loadDemoCinCredential,
    handleAuthorizationRequest,
  } = useOpenID();

  // credentials = StoredCredential[] (both PID and CIN)
}
```

---

## Testing

### Run Tests

```bash
cd frontend
npm test              # Run all 51 tests once
npm run test:watch    # Interactive watch mode
```

### Test File Summary

| Test File | Count | What's Covered |
|---|---|---|
| `sd-jwt.test.ts` | 12 | PID issuance (VCT, disclosures, decode), CIN issuance (VCT, 19 disclosures, decode), presentation creation, verification round-trip, selective disclosure field count |
| `oid4vp.test.ts` | 16 | URI parsing (valid + missing params + invalid JSON), credential matching (VCT filter, wrong VCT, field presence, deduplication), field extraction (skip metadata, required marking), response building, PID demo request, CIN demo request (parseable + correct fields) |
| `pid-credential.test.ts` | 9 | Demo claims (all mandatory, optional fields), NIC-to-PID mapping (adult, minor, defaults), validation (pass, fail, empty string), field labels coverage |
| `cin-credential.test.ts` | 6 | Demo claims (all 19 fields, same persona as PID), validation (pass, missing fields, empty string), field labels coverage |
| `WalletContext.test.ts` | 8 | Wallet connect (success, rejection, generic error, not installed, late injection polling), disconnect, double-connect guard |

**Total: 51 tests, all passing**

### Key Test Scenarios

**SD-JWT-VC round-trip:** Issue a credential -> create a presentation with 1 field -> verify the presentation -> confirm only 1 disclosure present, VCT intact, signature valid.

**CIN issuance:** Issue a CIN credential -> confirm VCT is `tn.gov.moi.cin.1` -> confirm exactly 19 disclosures -> decode and verify `nom`, `prenom`, `cin_number` values.

**OID4VP credential matching:** Create a request with VCT filter for `tn.gov.moi.cin.1` -> confirm only CIN credentials match (not PID). Create a request with no VCT filter but CIN-specific fields -> confirm matching by field presence.

---

## Adding New Credential Types

To add another credential type (e.g., Tunisian passport, driving license):

1. **Define types** in `src/types/eupid.ts`:
   - Add a VCT constant: `export const PASSPORT_VCT = 'tn.gov.moi.passport.1' as const;`
   - Add a claims interface: `export interface PassportCredentialClaims { ... }`
   - Extend the union: `export type CredentialClaims = PidCredentialClaims | CinCredentialClaims | PassportCredentialClaims;`

2. **Create credential service** at `src/services/openid/passport-credential.ts`:
   - `PASSPORT_FIELD_LABELS` -- human-readable labels
   - `createDemoPassportClaims()` -- demo data factory
   - `validatePassportClaims()` -- mandatory field validation

3. **Add issuance function** in `sd-jwt.ts`:
   - `issueDemoPassportCredential(claims)` with the new VCT and disclosure frame

4. **Add demo request factory** in `oid4vp.ts`:
   - `createDemoPassportAuthorizationRequestUri()` with the new VCT and relevant fields

5. **Update exports** in `index.ts`

6. **Update context** in `OpenIDContext.tsx`:
   - Add `loadDemoPassportCredential()` method
   - Update `addCredential()` date field resolution
   - Update consent label resolution with `PASSPORT_FIELD_LABELS`

7. **Update UI**:
   - `CredentialCard.tsx` -- add display branch for the new VCT (title, color, name resolution)
   - `PidCredentialStore.tsx` -- add load button

8. **Add tests**: credential service test + SD-JWT issuance test + OID4VP request test

---

## Demo Reference Files

Located in `frontend/public/demo_credentials/`:

| File | Description |
|---|---|
| `pid_sd_jwt_vc.json` | Decoded EU PID credential with all claim values and list of selectively disclosable fields |
| `cin_sd_jwt_vc.json` | Decoded Tunisian CIN credential with all 19 claim values |
| `demo_oid4vp_request.json` | Sample OID4VP authorization request (bank KYC verifier requesting PID attributes) |

These files are **reference only** -- actual credentials are issued at runtime as compact SD-JWT strings. The JSON files show what the decoded payload looks like.

---

## Glossary

| Term | Definition |
|---|---|
| **ARF** | Architecture Reference Framework -- EU's technical blueprint for the EUDI Wallet ecosystem |
| **CIN** | Carte d'Identite Nationale -- Tunisia's national identity card |
| **Consent Screen** | UI where the user reviews requested fields and approves/denies sharing |
| **Disclosure** | A base64url-encoded `[salt, claim_name, claim_value]` array revealing one claim from an SD-JWT |
| **ES256** | ECDSA signature algorithm using the P-256 curve and SHA-256 hash |
| **eIDAS 2.0** | EU regulation for electronic identification and trust services (revised) |
| **Input Descriptor** | Part of a Presentation Definition that describes one credential requirement (VCT, fields, format) |
| **KB-JWT** | Key Binding JWT -- appended to a presentation binding it to a specific verifier nonce and audience |
| **Lace Midnight Preview** | Browser wallet extension for the Midnight blockchain (v4 DApp Connector API) |
| **NIC** | National Identity Card (generic term; CIN is Tunisia's specific name for it) |
| **OID4VP** | OpenID for Verifiable Presentations -- protocol for verifiers to request credentials |
| **PID** | Person Identification Data -- EU's standard identity credential under eIDAS 2.0 |
| **Presentation Definition** | JSON structure describing which credentials and fields a verifier needs |
| **Presentation Submission** | Metadata in an OID4VP response mapping input descriptors to VP tokens |
| **SD-JWT** | Selective Disclosure JWT -- a JWT where individual claims can be hidden or revealed |
| **SD-JWT-VC** | SD-JWT Verifiable Credential -- an SD-JWT representing a verifiable credential with a `vct` type |
| **VCT** | Verifiable Credential Type -- URI-style identifier for the credential schema (e.g., `tn.gov.moi.cin.1`) |
| **VP Token** | Verifiable Presentation Token -- SD-JWT with only selected disclosures, presented to a verifier |
| **Web Crypto API** | W3C browser-native API for cryptographic operations (key generation, signing, hashing) |
