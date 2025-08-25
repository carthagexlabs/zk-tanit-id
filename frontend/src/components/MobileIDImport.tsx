import React, { useState } from "react";

type Props = { onImported: (cred: any) => void };

function hashDemo(input: string): string {
  // Demo hash (not cryptographically secure): replace with Poseidon/SHA
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return "0x" + h.toString(16).padStart(8, "0");
}

export default function MobileIDImport({ onImported }: Props) {
  const [status, setStatus] = useState<string>("");

  async function handleImport() {
    try {
      const res = await fetch("/demo_mobile_id/mobile_id_cert.json");
      const cert = await res.json();

      // --- Demo verification (stub) ---
      // In production: verify X.509 signature, policy OID, revocation via OCSP/CRL.
      const sigOk = !!cert.signature;

      // --- Derive commitments (demo) ---
      const nic = cert.subject?.serialNumber || "UNKNOWN";
      const nicCommitment = hashDemo(nic);
      const merkleRoot = hashDemo([
        cert.subject?.cn,
        cert.subject?.serialNumber,
        cert.subject?.phone,
        cert.validity?.notAfter
      ].join("|"));

      const mapped = {
        type: "NIC",
        issuer: cert.issuer,
        meta: {
          issuer_pubkey: "DEMO_TUNTRUST_PK",
          crl_root: "DEMO_TUNTRUST_CRL_ROOT",
          expiry: cert.validity?.notAfter || "2027-01-01T00:00:00Z",
          source: "Mobile-ID (simulated)"
        },
        commitments: { nicCommitment, merkleRoot },
        proofOfOrigin: {
          signatureOk: sigOk,
          policy: cert.policy,
          signatureAlg: cert.signatureAlg
        }
      };

      onImported(mapped);
      setStatus("✅ Imported Mobile‑ID and created NIC commitments (demo).");
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to import Mobile‑ID demo certificate.");
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={handleImport}>Simulate Mobile‑ID → ZKTanitID</button>
      {status && <span>{status}</span>}
    </div>
  );
}
