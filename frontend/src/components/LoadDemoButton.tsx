import React from "react";

type Props = {
  onLoaded: (cred: any) => void;
};

export default function LoadDemoButton({ onLoaded }: Props) {
  async function handleLoad() {
    try {
      const res = await fetch("/demo_credentials/full_nic_vc.json");
      const data = await res.json();

      // Map VC -> internal demo structure expected by ProofOptions
      const mapped = {
        type: "NIC",
        credentialSubject: data.credentialSubject,
        proof: data.proof,
        meta: {
          issuer_pubkey: "DEMO_ISSUER_PK",     // demo placeholder
          crl_root: "DEMO_CRL_ROOT",           // demo placeholder
          nationality: data.credentialSubject?.nationality || "TN",
          expiry: data.expirationDate || "2030-08-25"
        },
        commitments: {
          // demo commitments (in a real app derive from subject fields)
          nicCommitment: "0xDEMO_NIC_COMMITMENT",
          merkleRoot: "0xDEMO_MERKLE_ROOT"
        }
      };

      onLoaded(mapped);
    } catch (e) {
      console.error(e);
      alert("Failed to load demo credential.");
    }
  }

  return (
    <button onClick={handleLoad}>
      Load Demo NIC (one click)
    </button>
  );
}
