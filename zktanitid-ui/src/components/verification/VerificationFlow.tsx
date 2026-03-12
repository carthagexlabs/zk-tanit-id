import { useState } from "react";
import { StepIndicator } from "../layout/StepIndicator";
import { CredentialLoadStep } from "./steps/CredentialLoadStep";
import { ContractExecutionStep } from "./steps/ContractExecutionStep";
import { DeployContractStep } from "./steps/DeployContractStep";
import { ProofGenerationStep } from "./steps/ProofGenerationStep";
import { ProofSubmissionStep } from "./steps/ProofSubmissionStep";
import { VerificationCompleteStep } from "./steps/VerificationCompleteStep";
import { ArrowLeft } from "lucide-react";
import type { ProofData } from "../../types/proof";
import type { SdJwtCredential, SelectedClaim } from "../../types/credential";

interface VerificationFlowProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onReset: () => void;
}

const steps = [
  { title: "Load Credential", description: "Import SD-JWT VC & select claims" },
  {
    title: "Contract Execution",
    description: "Local privacy-preserving validation",
  },
  {
    title: "Deploy Contract",
    description: "Deploy to Midnight network",
  },
  { title: "Generate Proof", description: "Create zero-knowledge proof" },
  { title: "Submit to Midnight", description: "Send proof to blockchain" },
  {
    title: "Verification Complete",
    description: "Identity verified successfully",
  },
];

export function VerificationFlow({
  currentStep,
  onStepChange,
  onReset,
}: VerificationFlowProps) {
  const [credential, setCredential] = useState<SdJwtCredential | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<SelectedClaim[]>([]);
  const [contractAddress, setContractAddress] = useState<string>("");

  // Derive userData from credential for backward compat with existing steps
  const userData = {
    dateOfBirth: "",
    nic: selectedClaims.find((c) => c.claim_name === "document_number")?.claim_value as string ?? "",
    education: "",
    verificationClaim: "valid_nic",
  };

  // Lifted proof state to pass between steps
  const [proofData, setProofData] = useState<ProofData | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleCredentialLoaded = (cred: SdJwtCredential, claims: SelectedClaim[]) => {
    setCredential(cred);
    setSelectedClaims(claims);
    handleNext();
  };

  const handleContractDeployed = (address: string) => {
    setContractAddress(address);
    handleNext();
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 pt-24 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between animate-slide-in-from-top">
          <button
            onClick={onReset}
            className="flex items-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-105 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="text-right animate-fade-in-left">
            <h2 className="text-2xl font-bold text-white transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400 hover:bg-clip-text">
              Identity Verification
            </h2>
            <p className="text-slate-400 transition-all duration-300 hover:text-slate-300">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>

        <div className="animate-fade-in-up animation-delay-200">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        <div className="mt-12 animate-fade-in-up animation-delay-400">
          {currentStep === 1 && (
            <CredentialLoadStep onNext={handleCredentialLoaded} />
          )}
          {currentStep === 2 && credential && (
            <ContractExecutionStep
              credential={credential}
              selectedClaims={selectedClaims}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <DeployContractStep
              onNext={handleContractDeployed}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <ProofGenerationStep
              userData={userData}
              onNext={handleNext}
              onBack={handleBack}
              onProofGenerated={setProofData}
            />
          )}
          {currentStep === 5 && (
            <ProofSubmissionStep
              onNext={handleNext}
              onBack={handleBack}
              proofData={proofData}
              userData={userData}
            />
          )}
          {currentStep === 6 && (
            <VerificationCompleteStep userData={userData} onReset={onReset} />
          )}
        </div>
      </div>
    </section>
  );
}
