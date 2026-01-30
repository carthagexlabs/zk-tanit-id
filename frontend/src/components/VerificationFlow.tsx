import React, { useState } from "react";
import { StepIndicator } from "./StepIndicator";
import { DataInputStep } from "./steps/DataInputStep";
import { ContractExecutionStep } from "./steps/ContractExecutionStep";
import { ProofGenerationStep } from "./steps/ProofGenerationStep";
import { ProofSubmissionStep } from "./steps/ProofSubmissionStep";
import { VerificationCompleteStep } from "./steps/VerificationCompleteStep";
import { ArrowLeft } from "lucide-react";
import { ProofData } from "../contexts/WalletContext";

interface VerificationFlowProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onReset: () => void;
}

const steps = [
  { title: "Input Data", description: "Enter your sensitive information" },
  {
    title: "Contract Execution",
    description: "Local privacy-preserving-validation",
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
  const [userData, setUserData] = useState({
    dateOfBirth: "",
    nic: "",
    education: "",
    verificationClaim: "age_over_18",
  });

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
            <DataInputStep
              userData={userData}
              onDataChange={setUserData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <ContractExecutionStep
              userData={userData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <ProofGenerationStep
              userData={userData}
              onNext={handleNext}
              onBack={handleBack}
              onProofGenerated={setProofData}
            />
          )}
          {currentStep === 4 && (
            <ProofSubmissionStep
              onNext={handleNext}
              onBack={handleBack}
              proofData={proofData}
              userData={userData}
            />
          )}
          {currentStep === 5 && (
            <VerificationCompleteStep userData={userData} onReset={onReset} />
          )}
        </div>
      </div>
    </section>
  );
}
