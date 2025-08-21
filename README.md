# TanitID on Midnight - Privacy-Preserving Identity Attestations

<p align="center">
  <img src="assets/zktanitid-logo.png" width="400" />
</p>

**Protect facts, not data.** TanitID shows how to use **Midnight’s Compact smart contracts** and a **MidnightJS** web app to verify facts about a user — like **Age ≥ 18**, **Valid CIN**, or **Student Status** — **without revealing raw personal data (PII)**.

### ✨ Why “TanitID”
We chose the name **TanitID** after [Tanit](https://en.wikipedia.org/wiki/Tanit), the Carthaginian goddess of protection and fertility, whose symbol remains one of Tunisia’s most enduring cultural icons. Just as Tanit safeguarded her people, **TanitID protects users’ digital identities**: revealing only what is necessary and keeping everything else hidden. This blend of **heritage and innovation** positions TanitID as a uniquely Tunisian approach to privacy-preserving digital identity — rooted in trust, designed for the future.

---

## Why Tunisia (problem background)
Tunisia’s rapid digitization has outpaced its privacy safeguards. Civil society has warned that the government’s **Mobile ID (e‑Houwiya)** program launched with limited transparency and weak oversight, risking users’ data protection and trust ([Access Now — Mobile ID “black box”](https://www.accessnow.org/tunisia-must-open-mobile-id-black-box/)).

Beyond Mobile ID, a trio of initiatives — **biometric ID**, **Mobile ID**, and a **subsidies compensation platform** — has been criticized for opacity and the potential to enable mass surveillance, identity theft, and data exploitation if deployed without robust safeguards ([Access Now — digitization risks](https://www.accessnow.org/tunisias-digitization-programs-threaten-the-privacy-of-millions/); [press: postpone subsidies platform](https://www.accessnow.org/press-release/tunisia-postpone-digital-platform-for-subsidies-compensation-launch/)).

These risks are not theoretical: in **July 2025**, Tunisia’s **national university network** reportedly suffered a data leak affecting up to ~150,000 students ([SearchInform 2025 roundup](https://searchinform.com/blog/2025/7/16/data-breaches-in-saudi-arabia-and-tunisia/)).

At the same time, private‑sector **KYC/AML** practices push for extensive data collection and long retention horizons, amplifying exposure ([VOVE ID — KYC in Tunisia, 2025](https://blog.voveid.com/kyc-compliance-in-tunisia-a-2025-guide-for-digital-businesses/)).

**Our approach:** ZK TanitID attestations — **prove the fact**, don’t expose the data.

---

## Demo Features
- ✅ **Age ≥ 18** verifier (no DOB disclosure)
- ✅ **Valid CIN** verifier (no CIN number disclosure; supports revocation root)
- ✅ **Current Student** verifier (term-bounded, identity‑preserving)
- 🔒 **No raw PII on‑chain** — only commitments + ZK proofs
- 🧾 **Open-source** (Apache‑2.0) and auditable (avoids “black box” concerns)

---

## Architecture
- **Contracts (Compact):** verifier contracts for age, CIN validity, and student status.
- **Frontend (MidnightJS):** request → generate proof locally → submit to contract.
- **Data:** credentials are stored client‑side; blockchain sees only **commitments & proofs**.

```
/contracts
  verifier_age.compact
  verifier_cin.compact
  verifier_student.compact
/frontend
  src/
    App.tsx
    main.tsx
    components/ProofForm.tsx
    services/midnight.ts
  index.html
/docs
  THREAT_MODEL.md
LICENSE
```

---

TanitID leverages Midnight’s split-computation model:

- **Off-Chain (User Device):**  
  Sensitive data (e.g., DOB, residency, education) is processed locally.  
  Compact contracts run on the device, generating a ZK proof.  

- **ZK Proofs Bridge:**  
  Only the proof is sent to the chain, ensuring no personal data is leaked.  

- **On-Chain (Midnight VM):**  
  The blockchain validates the proof without accessing the underlying private data.  

This ensures compliance with data protection while enabling verifiable identity checks.

![TanitID Flowchart](./assets/tanitid_midnight_flowchart.png)

### How It Works

1. **User Inputs Data (Off-Chain)**  
   The citizen enters sensitive details such as Date of Birth, residency, or education records into the TanitID app.  
   This information **never leaves their device**.

2. **Compact Contract Execution**  
   A privacy-preserving smart contract, written in Compact, runs locally.  
   It checks the required condition (e.g., "Is user over 18?" or "Does user have valid residency?").

3. **Zero-Knowledge Proof Generation**  
   Instead of sending raw data, the app generates a **ZK proof** that the condition holds true.  
   Example: *“I am over 18”* without revealing the actual date of birth.

4. **Proof Submission to Midnight**  
   The proof is sent to the Midnight blockchain.  
   The chain cannot see the user’s private data—only the proof.

5. **On-Chain Verification**  
   Midnight’s VM verifies the proof and updates the smart contract state.  
   This enables trusted identity attestation without exposing sensitive information.

✅ With this flow, TanitID ensures **compliance, privacy, and verifiability** in digital identity use cases.
