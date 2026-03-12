# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZKTanitID is a privacy-preserving identity attestation system built on the Midnight blockchain. It uses zero-knowledge proofs to verify that a user holds a valid CIN (Carte d'Identité Nationale) without revealing raw personal data (PII).

**Key principle:** "Prove the fact, don't expose the data."

## Development Commands

All commands run from the `zktanitid-ui/` directory:

```bash
cd zktanitid-ui
npm install    # Install dependencies
npm run dev    # Start Vite dev server (hot reload)
npm run build  # Production build
npm run lint   # Run ESLint
npm run preview # Preview production build locally
npm run clean # Clean project (remove build artifacts and dependencies)

```

## Architecture

```
├── contracts/                  # Midnight Compact smart contracts
│   └── cin_verifier.compact
├── scripts/
│   └── deploy.ts               # Contract deployment script
├── infra/                      # Infrastructure & DevOps
│   └── docker-compose.yml      # Proof server (Docker)
├── zktanitid-ui/               # React + TypeScript + Vite application
│   ├── public/
│   │   └── demo/               # Demo/mock data (consolidated)
│   │       ├── credentials/    # SD-JWT VC, NIC VC, selective disclosure
│   │       └── mobile_id/      # Mobile ID certificate
│   └── src/
│       ├── components/
│       │   ├── layout/         # Header, Footer, StepIndicator
│       │   ├── credential/     # CredentialDashboard, CredentialUploader, LoadDemoButton, MobileIDImport
│       │   ├── verification/   # VerificationFlow, VerifierDashboard, ProofOptions
│       │   │   └── steps/      # 5-step verification flow components
│       │   │       ├── CredentialLoadStep.tsx
│       │   │       ├── ContractExecutionStep.tsx
│       │   │       ├── ProofGenerationStep.tsx
│       │   │       ├── ProofSubmissionStep.tsx
│       │   │       └── VerificationCompleteStep.tsx
│       │   └── wallet/         # Hero (wallet connect landing)
│       ├── contexts/           # WalletContext (React context + provider)
│       ├── hooks/              # useWallet custom hook
│       ├── types/              # Shared TypeScript types
│       │   ├── credential.ts   # SdJwtCredential, SelectedClaim, Disclosure
│       │   ├── proof.ts        # ProofData, VerifierKind
│       │   └── wallet.ts       # WalletContextType
│       ├── services/           # Business logic
│       │   ├── credential.ts   # SD-JWT parsing, claim extraction
│       │   └── zktanitid.ts    # ZK proof generation (demo stub)
│       └── test-utils/         # Test setup (Vitest + jsdom)
└── docs/                       # Documentation (THREAT_MODEL.md, TUTORIAL.md)
```

## Key Technical Details

### Midnight Integration
- Uses `@midnight-ntwrk/dapp-connector-api` for wallet connection
- Wallet integration is in `components/layout/Header.tsx` - connects to Lace Beta Wallet
- Target network: Midnight Preprod

### Current Implementation State
- **Frontend UI:** Fully implemented with 5-step verification flow
- **ZK Proof Service (`services/zktanitid.ts`):** Demo stub - returns fake proofs for UI testing. Needs replacement with real MidnightJS implementation.
- **Compact Contracts:** Empty stub files - need actual Compact contract code

### Verification Flow
1. User enters private data locally (CIN details)
2. Off-chain Compact contract validates CIN
3. ZK proof is generated locally (currently demo)
4. Proof submitted to Midnight blockchain
5. On-chain verification without exposing PII

### Tech Stack
- React 19 + TypeScript 5
- Vite for bundling
- Tailwind CSS for styling
- Lucide React for icons

## Terminology
- **NIC:** National Identity Card (previously called CIN in codebase)
- **Compact:** Midnight's smart contract language for privacy-preserving computation
- **MidnightJS:** JavaScript SDK for interacting with Midnight blockchain