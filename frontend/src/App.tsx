import React, { useState } from "react";
import CredentialUploader from "./components/CredentialUploader";
import CredentialDashboard from "./components/CredentialDashboard";
import ProofOptions from "./components/ProofOptions";
import VerifierDashboard from "./components/VerifierDashboard";

function App() {
  const [credential, setCredential] = useState<any | null>(null);

  const loadDemoNIC = async () => {
    try {
      const res = await fetch("/demo_credentials/full_nic_vc.json");
      const json = await res.json();
      setCredential(json);
      alert("✅ Demo NIC loaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to load demo NIC credential.");
    }
  };

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: "0 16px", fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <h1>ZKTanitID DApp</h1>
      <p>Prove NIC, Driver’s Licence, and Student Enrolment without exposing personal data.</p>

      <section style={{ marginTop: 16 }}>
        <h2>1) Add Credential (one-time)</h2>
        <CredentialUploader onUpload={setCredential} />
        <button style={{ marginTop: 12 }} onClick={loadDemoNIC}>
          Load Demo NIC Credential
        </button>
      </section>

      <section>
        <CredentialDashboard
          creds={[
            { type: "NIC", issuer: "Tunisia NIC Authority", expiry: "2030-08-25" },
            { type: "Driver", issuer: "Transport Ministry", expiry: "2028-09-01" },
            { type: "Student", issuer: "Université de Tunis", expiry: "2026-07-01" }
          ]}
        />
      </section>

      {credential && (
        <section>
          <h2>2) Generate Proofs</h2>
          <ProofOptions kind="nic_valid" credential={credential} />
          <ProofOptions kind="driver_valid" credential={credential} />
          <ProofOptions kind="student_enrolled" credential={credential} />
        </section>
      )}

      <footer style={{ marginTop: 32, opacity: 0.8 }}>
        <small>Demo only — all data here is mock. No real PII is processed.</small>
      </footer>
      <VerifierDashboard />
    </main>
  );
}

export default App;
