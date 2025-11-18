import React, { useState } from "react";
import { generateProof } from "../services/zktanitid";

export default function ProofOptions({
  kind,
  credential,
}: {
  kind: string;
  credential: any;
}) {
  const [proof, setProof] = useState<any | null>(null);
  const [policyId, setPolicyId] = useState("default-policy-2025");
  const [revealExtra, setRevealExtra] = useState(false);

  const handleGenerate = async () => {
    const publicInputs: any = {
      policy_id: policyId,
      issuer_pubkey: credential?.meta?.issuer_pubkey || "DEMO_ISSUER_PK",
      crl_root: credential?.meta?.crl_root || "DEMO_CRL_ROOT",
    };
    if (revealExtra) {
      publicInputs.nationality = credential?.meta?.nationality || "TN";
    }
    try {
      const p = await generateProof(kind as any, { credential, publicInputs });
      setProof({ ...p, policy_id: policyId });
    } catch (err) {
      console.error(err);
      alert("Failed to generate proof (check console).");
    }
  };

  return (
    <div
      style={{
        padding: 12,
        margin: "12px 0",
        borderRadius: 12,
        border: "1px solid #eaeaea",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        Generate <code>{kind}</code> Proof
      </h3>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label>
          Policy ID:&nbsp;
          <input
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={revealExtra}
            onChange={(e) => setRevealExtra(e.target.checked)}
          />
          &nbsp;Reveal extra field (e.g. nationality)
        </label>
        <button onClick={handleGenerate}>Generate Proof</button>
      </div>
      {proof && (
        <details open style={{ marginTop: 8 }}>
          <summary>Proof JSON</summary>
          <pre style={{ overflowX: "auto" }}>
            {JSON.stringify(proof, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
