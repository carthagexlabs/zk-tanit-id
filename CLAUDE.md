# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZKTanitID is a privacy-preserving identity attestation system built on the Midnight blockchain. It uses zero-knowledge proofs to verify facts about users (Age ≥ 18, Valid NIC, Student Enrollment) without revealing raw personal data (PII).

**Key principle:** "Prove the fact, don't expose the data."

## Development Commands

All commands run from the `frontend/` directory:

```bash
cd frontend
npm install    # Install dependencies
npm run dev    # Start Vite dev server (hot reload)
npm run build  # Production build
npm run lint   # Run ESLint
npm run preview # Preview production build locally
npm run clean # Clean project (remove build artifacts and dependencies)

```

## Architecture

```
├── contracts/           # Midnight Compact smart contracts (stub files)
│   ├── verifier_age.compact
│   ├── verifier_nic.compact
│   └── verifier_student.compact
├── frontend/            # React + TypeScript + Vite application
│   └── src/
│       ├── components/
│       │   ├── steps/   # 5-step verification flow components
│       │   │   ├── DataInputStep.tsx
│       │   │   ├── ContractExecutionStep.tsx
│       │   │   ├── ProofGenerationStep.tsx
│       │   │   ├── ProofSubmissionStep.tsx
│       │   │   └── VerificationCompleteStep.tsx
│       │   ├── Header.tsx           # Wallet connection via Lace Beta
│       │   └── VerificationFlow.tsx # Main flow orchestrator
│       └── services/
│           └── zktanitid.ts  # ZK proof generation (demo stub)
└── docs/                # Documentation (THREAT_MODEL.md, TUTORIAL.md)
```

## Key Technical Details

### Midnight Integration
- Uses `@midnight-ntwrk/dapp-connector-api` for wallet connection
- Wallet integration is in `Header.tsx` - connects to Lace Beta Wallet
- Target network: Midnight Testnet

### Current Implementation State
- **Frontend UI:** Fully implemented with 5-step verification flow
- **ZK Proof Service (`services/zktanitid.ts`):** Demo stub - returns fake proofs for UI testing. Needs replacement with real MidnightJS implementation.
- **Compact Contracts:** Empty stub files - need actual Compact contract code

### Verification Flow
1. User enters private data locally (DOB, NIC, education level)
2. Off-chain Compact contract validates conditions
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
