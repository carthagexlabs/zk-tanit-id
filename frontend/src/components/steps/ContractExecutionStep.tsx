import React, { useState, useEffect } from "react";
import { Code, CheckCircle, Loader, ArrowLeft } from "lucide-react";

interface UserData {
  dateOfBirth: string;
  nic: string;
  education: string;
  verificationClaim: string;
}

interface ContractExecutionStepProps {
  userData: UserData;
  onNext: () => void;
  onBack: () => void;
}

export function ContractExecutionStep({
  userData,
  onNext,
  onBack,
}: ContractExecutionStepProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState([
    {
      name: "Loading Compact contract",
      completed: false,
      current: false,
      time: "1.2s",
    },
    {
      name: "Validating input data",
      completed: false,
      current: false,
      time: "1.5s",
    },
    {
      name: "Executing privacy checks",
      completed: false,
      current: false,
      time: "2.1s",
    },
    {
      name: "Computing verification result",
      completed: false,
      current: false,
      time: "1.8s",
    },
  ]);

  useEffect(() => {
    if (!isExecuting) return;

    const executeSteps = async () => {
      // Reset all steps first
      setExecutionSteps((prev) =>
        prev.map((step) => ({
          ...step,
          current: false,
          completed: false,
        }))
      );

      // Execute each step with proper timing
      for (let i = 0; i < executionSteps.length; i++) {
        // Set current step
        setExecutionSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            current: index === i,
            completed: index < i,
          }))
        );

        // Wait for step execution (with varying times for more realistic feel)
        const stepTime = 1500 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, stepTime));

        // Complete current step
        setExecutionSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            current: index > i && index === i + 1, // Set next step as current
            completed: index <= i,
          }))
        );

        // Small pause between steps
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Final pause before moving to next step
      await new Promise((resolve) => setTimeout(resolve, 800));
      onNext();
    };

    executeSteps();
  }, [isExecuting, onNext]);

  const getClaimDescription = () => {
    switch (userData.verificationClaim) {
      case "age_over_18":
        return "Checking if date of birth indicates age over 18";
      case "age_over_21":
        return "Checking if date of birth indicates age over 21";
      case "valid_nic":
        return "Validating NIC format and checksum";
      case "education_level":
        return "Verifying education credentials";
      default:
        return "Executing privacy-preserving validation";
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-3">
          Compact Contract Execution
        </h3>
        <p className="text-slate-300">
          Running privacy-preserving smart contract locally on your device to
          validate your claim.
        </p>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Code className="h-6 w-6 text-blue-400" />
          <h4 className="text-lg font-semibold text-white">Contract Details</h4>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Contract Type:</span>
            <span className="text-white font-medium">
              Identity Verification
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Language:</span>
            <span className="text-white font-medium">Compact</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Execution:</span>
            <span className="text-white font-medium">Local (Off-chain)</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-slate-400">Validation:</span>
            <span className="text-white font-medium text-right max-w-md">
              {getClaimDescription()}
            </span>
          </div>
        </div>
      </div>

      {!isExecuting ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Code className="h-8 w-8 text-purple-400" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-3">
            Ready to Execute Contract
          </h4>
          <p className="text-slate-400 mb-8">
            The Compact smart contract will run locally to verify your claim
            without exposing sensitive data.
          </p>
          <button
            onClick={() => setIsExecuting(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
          >
            Execute Contract
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {executionSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 transition-all duration-300"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                  step.completed
                    ? "bg-green-600 shadow-lg shadow-green-600/20"
                    : step.current
                    ? "bg-purple-600 shadow-lg shadow-purple-600/20 scale-110"
                    : "bg-slate-700"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-white animate-[scaleIn_0.3s_ease-out_forwards]" />
                ) : step.current ? (
                  <div className="relative">
                    <Loader className="h-5 w-5 text-white animate-spin" />
                    <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <span className="text-white text-sm font-medium opacity-50">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium transition-all duration-300 ${
                    step.completed
                      ? "text-green-400"
                      : step.current
                      ? "text-purple-300 transform translate-x-1"
                      : "text-slate-500"
                  }`}
                >
                  {step.name}
                </p>
                {step.current && (
                  <p className="text-sm text-slate-400 mt-1 animate-[fadeIn_0.3s_ease-out_forwards]">
                    Processing...
                  </p>
                )}
                {step.completed && (
                  <p className="text-sm text-green-300 mt-1 animate-[fadeIn_0.3s_ease-out_forwards]">
                    ✓ Complete
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isExecuting && (
        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
      )}
    </div>
  );
}
