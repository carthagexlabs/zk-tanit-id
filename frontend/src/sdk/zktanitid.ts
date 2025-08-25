// minimal demo stub so the UI runs; replace with real MidnightJS later
export type VerifierKind = 'nic_valid' | 'driver_valid' | 'student_enrolled';

export async function generateProof(
  kind: VerifierKind,
  payload: any
) {
  // return something that looks like a proof for demo
  return {
    proof: `DEMO_PROOF_${kind}_${Date.now()}`,
    publicInputs: payload?.publicInputs ?? {},
    kind
  };
}

export async function verifyProof(
  kind: VerifierKind,
  proofObj: any
) {
  // accept our demo proofs only
  return Boolean(proofObj?.proof?.startsWith(`DEMO_PROOF_${kind}_`));
}
