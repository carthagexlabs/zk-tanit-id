export type VerifierKind = 'nic_valid' | 'driver_valid' | 'student_enrolled';

export interface ProofData {
  proof: string;
  publicInputs: Record<string, unknown>;
  kind: string;
  timestamp: number;
}
