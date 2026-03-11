// frontend/src/components/CredentialUploader.tsx
import React, { useState } from "react";

export default function CredentialUploader({ onUpload }: { onUpload: (c: any) => void }) {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const f = e.target.files[0];
      setFile(f);
      const text = await f.text();
      try {
        const json = JSON.parse(text);

        // Wrap in the structure expected by ProofOptions
        const mapped = {
          ...json,
          meta: {
            issuer_pubkey: json.publicInputs?.issuer_pubkey || "DEMO_ISSUER_PK",
            crl_root: json.publicInputs?.crl_root || "DEMO_CRL_ROOT",
            expiry: json.expiry || "2030-01-01T00:00:00Z",
            nationality: json.credentialSubject?.nationality || "TN"
          },
          commitments: {
            nicCommitment: json.commitments?.nicCommitment || "0xDEMO_NIC_COMMITMENT",
            merkleRoot: json.commitments?.merkleRoot || "0xDEMO_MERKLE_ROOT"
          }
        };

        onUpload(mapped);
      } catch {
        alert("Invalid credential file");
      }
    }
  };

  return (
    <div className="uploader">
      <input type="file" accept=".json" onChange={handleFile} />
      {file && <p>Loaded: {file.name}</p>}
    </div>
  );
}