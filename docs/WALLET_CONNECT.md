# Wallet Connection - Technical Documentation

## Overview

ZK-Tanit-ID integrates with the **Lace Midnight Preview** browser extension wallet using the **v4 DApp Connector API** (`@midnight-ntwrk/dapp-connector-api@4.0.0`). This document describes the architecture, connection flow, error handling, and developer guidance for the wallet integration.

## Prerequisites

| Requirement | Details |
|---|---|
| Wallet Extension | [Lace Midnight Preview](https://chrome.google.com/webstore) v2.38.0+ (separate from the regular Cardano Lace wallet) |
| Network | `preprod` (Midnight Pre-Production Testnet) |
| API Version | v4 DApp Connector API |
| Injection Point | `window.midnight.mnLace` |

## Architecture

### Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│  WalletProvider (React Context)                          │
│  frontend/src/contexts/WalletContext.tsx                  │
│                                                          │
│  State: walletApi, isConnected, isConnecting,            │
│         userAddress, configuration                       │
│                                                          │
│  Methods: connect(), disconnect(),                       │
│           submitProofTransaction()                       │
├──────────────────────────────────────────────────────────┤
│                  useWallet() Hook                        │
│          frontend/src/hooks/useWallet.ts                 │
├────────────────────┬─────────────────────────────────────┤
│  Header.tsx        │  Hero.tsx                           │
│  "Connect Wallet"  │  "Connect Wallet First"             │
│  (top navbar)      │  (main CTA, swaps to               │
│                    │   "Start Verification"              │
│                    │   when connected)                   │
└────────────────────┴─────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|---|---|
| `frontend/src/contexts/WalletContext.tsx` | Core wallet logic: provider, state, connect/disconnect/submit |
| `frontend/src/hooks/useWallet.ts` | Convenience hook wrapping `useContext(WalletContext)` |
| `frontend/src/components/Header.tsx` | Navbar connect button, displays truncated address when connected |
| `frontend/src/components/Hero.tsx` | Hero CTA button, toggles between "Connect Wallet First" and "Start Verification" |

## Connection Flow

The connection follows a 5-step sequence with detailed console logging at each stage:

### Step 1 - Detect Wallet Extension

```
waitForWalletProvider(timeoutMs = 3000)
```

Polls `window.midnight.mnLace` every **100ms** for up to **3 seconds**. This accounts for the browser extension's asynchronous injection timing.

- **Success:** Returns the `InitialAPI` object (contains `name`, `apiVersion`, `connect()`)
- **Failure:** Returns `null` and an alert prompts the user to install Lace Midnight Preview

### Step 2 - Request Authorization

```typescript
wallet.connect("preprod")  // v4 API
```

Calls `connect(networkId)` which triggers the Lace popup asking the user to authorize the DApp. A **60-second timeout** wraps this call to prevent indefinite hanging if the user closes the popup without responding.

> **Note:** The v3 API used `enable()` instead. This project uses the v4 `connect(networkId)` method.

- **Success:** Returns a `ConnectedAPI` object with full wallet methods
- **Failure:** Throws `DAppConnectorAPIError` with code `Rejected` if user denies

### Step 3 - Fetch Shielded Address

```typescript
api.getShieldedAddresses()
```

Retrieves the user's shielded (private) address from the connected wallet.

- **Result:** `{ shieldedAddress: string }` - stored in context state

### Step 4 - Fetch Network Configuration

```typescript
api.getConfiguration()
```

Retrieves the wallet's network configuration.

- **Result:** `{ networkId, indexerUri, substrateNodeUri }` - stored in context state

### Step 5 - Connection Complete

All state is committed:
- `walletApi` = connected API instance
- `isConnected` = `true`
- `userAddress` = shielded address
- `configuration` = network config

## Double-Connect Prevention

Two connect buttons exist (Header and Hero). A **synchronous ref guard** (`connectingRef`) prevents race conditions:

```typescript
const connectingRef = useRef(false);

const connect = useCallback(async () => {
  if (connectingRef.current || isConnected) return; // Block duplicate calls
  connectingRef.current = true;
  // ...connection logic...
  connectingRef.current = false; // Reset in finally block
}, [isConnected]);
```

React state updates (`setIsConnecting`) are asynchronous and may not propagate fast enough between two rapid button clicks. The `useRef` guard is synchronous and provides an immediate lock.

## Disconnect

```typescript
disconnect()
```

Resets all local state to defaults (`walletApi = null`, `isConnected = false`, etc.). The v4 DApp Connector API does not expose a `wallet.disconnect()` method, so only client-side state is cleared.

## Transaction Submission

```typescript
submitProofTransaction(proofData: ProofData): Promise<void>
```

Used after ZK proof generation to submit a proof transaction to the Midnight blockchain:

1. **Balance** the sealed transaction: `walletApi.balanceSealedTransaction(proofData.proof)`
2. **Submit** to network: `walletApi.submitTransaction(balanced.tx)`

### ProofData Interface

```typescript
interface ProofData {
  proof: string;                          // Serialized proof data
  publicInputs: Record<string, unknown>;  // Public inputs for verification
  kind: string;                           // Proof type: "age", "nic", "student"
  timestamp: number;                      // Generation timestamp
}
```

> **Current state:** The proof service (`services/zktanitid.ts`) is a demo stub returning fake proofs. `submitProofTransaction` will need real Compact contract transaction data when integrated with actual contracts.

## Error Handling

### Error Types

| Error | Cause | User Feedback |
|---|---|---|
| Wallet not detected | Extension not installed or not injected within 3s | Alert: install Lace Midnight Preview |
| `DAppConnectorAPIError` (code: `Rejected`) | User denied authorization in Lace popup | Alert: "Connection was rejected" |
| `DAppConnectorAPIError` (other codes) | Wallet-side errors | Alert with error reason/code |
| Timeout (60s) | User closed popup without responding | Alert: "Wallet connection timed out" |
| `RemoteApiShutdownError` | Extension crashed or needs reinstall | Reinstall Lace Midnight Preview extension |
| Blank Lace popup | Extension version mismatch or corruption | Update/reinstall extension to v2.38.0+ |

### Console Logging

All connection steps are logged with the `[ZKTanitID]` prefix for easy filtering:

```
[ZKTanitID] Step 1/5: Searching for Lace Midnight Preview extension...
[ZKTanitID] Step 1/5 OK: Wallet found: mnLace v4.0.0
[ZKTanitID] Step 2/5: Calling wallet.connect("preprod")...
[ZKTanitID] Step 2/5 OK: Authorization granted.
[ZKTanitID] Step 3/5: Fetching shielded address...
[ZKTanitID] Step 3/5 OK: Shielded address: 0x...
[ZKTanitID] Step 4/5: Fetching network configuration...
[ZKTanitID] Step 4/5 OK: Configuration: { networkId, indexerUri, ... }
[ZKTanitID] Step 5/5: Wallet fully connected!
```

## Available ConnectedAPI Methods

After a successful connection, the following v4 API methods are available on `walletApi`:

| Method | Purpose |
|---|---|
| `getShieldedAddresses()` | Get user's shielded (private) address |
| `getConfiguration()` | Get network config (networkId, indexer, node URIs) |
| `balanceSealedTransaction(tx)` | Balance a sealed transaction before submission |
| `submitTransaction(tx)` | Submit a balanced transaction to the network |

## Supported Networks

The `connect(networkId)` method accepts these network IDs:

| Network ID | Description |
|---|---|
| `mainnet` | Midnight Mainnet |
| `preprod` | Pre-Production Testnet (current project default) |
| `preview` | Preview Testnet |
| `qanet` | QA Network |
| `undeployed` | Local/undeployed network |

To change the target network, update the constant in `WalletContext.tsx`:

```typescript
const MIDNIGHT_NETWORK_ID = 'preprod'; // Change this value
```

## Testing

Unit tests are located at `frontend/src/contexts/WalletContext.test.tsx` (8 tests).

```bash
cd frontend
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

Tests use **Vitest + jsdom + @testing-library/react** with the setup file at `frontend/src/test/setup.ts`.

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---|---|---|
| "Wallet not detected" alert | Extension not installed | Install Lace Midnight Preview from Chrome Web Store |
| Blank popup appears then closes | Extension version mismatch | Update to Lace Midnight Preview v2.38.0+ |
| `RemoteApiShutdownError` in console | Extension crashed | Reinstall the extension |
| "Connection timed out after 60s" | User didn't respond to popup | Retry and approve in the Lace popup |
| "Connection was rejected" | User clicked Deny in Lace popup | Retry and click Approve |
| Connect button unresponsive | Double-connect guard active | Refresh the page and try again |
| `walletApi` is null after connect | Connection failed silently | Check browser console for `[ZKTanitID]` logs |
