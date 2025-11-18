import React, { useState } from "react";
import { verifyProof } from "../services/zktanitid";

const KINDS = ["nic_valid", "driver_valid", "student_enrolled"] as const;
type Kind = (typeof KINDS)[number];

export default function VerifierDashboard() {
  const [kind, setKind] = useState<Kind>("nic_valid");
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<string>("");

  async function handleVerify() {
    try {
      const obj = JSON.parse(input);
      const proof = obj.proof ?? obj; // allow raw proof or wrapper {proof, publicInputs}
      const ok = await verifyProof(kind as any, proof);
      setResult(ok ? "✅ Proof Accepted" : "❌ Proof Rejected");
    } catch (e) {
      console.error(e);
      setResult("⚠️ Invalid JSON or verification error. See console.");
    }
  }

  return (
    <section
      style={{
        marginTop: 24,
        padding: 12,
        border: "1px solid #eaeaea",
        borderRadius: 12,
      }}
    >
      <h2>Verifier Dashboard (Bank / Gov Simulation)</h2>
      <p>
        Paste a proof JSON (from the Wallet UI) and verify it like a bank or
        government service would.
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <label>
          Verifier kind:&nbsp;
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleVerify}>Verify Proof</button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste proof JSON here"
        style={{
          width: "100%",
          minHeight: 160,
          fontFamily: "monospace",
          fontSize: 12,
        }}
      />
      {result && <p style={{ marginTop: 8, fontWeight: 600 }}>{result}</p>}
    </section>
  );
}
